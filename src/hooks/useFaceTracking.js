import { useState, useRef, useEffect, useCallback } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

/**
 * useFaceTracking Hook — Step 4 Local MediaPipe Face Landmark & Expression Telemetry
 * 
 * Strict Guidelines:
 * - Single face tracking using local MediaPipe Tasks Vision.
 * - Individualized resting face baseline calibration (prevents false-positive furrowed brows).
 * - Comprehensive optical expression heuristics:
 *   * Furrowed brow / annoyed tension (measured as percentage drop relative to personal resting baseline)
 *   * Raised eyebrows (surprise/skepticism)
 *   * Smile approximation
 *   * Mouth aperture / exasperation
 *   * Squinting / eye strain
 *   * Head shaking (disapproval) / head nodding / head velocity
 *   * Composite Agitation Index (0-100%)
 * - Zero network uploads; 100% in-browser processing.
 * - Performance optimized: throttled React state updates, cleanup on unmount.
 */
export function useFaceTracking(videoRef, isStreaming) {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelError, setModelError] = useState(null);
  const [baselineReady, setBaselineReady] = useState(false);

  // Optical Telemetry State (Throttled for smooth React rendering)
  const [telemetry, setTelemetry] = useState({
    faceDetected: false,
    facesCount: 0,
    primaryExpression: 'STANDBY',
    expressionLabel: 'STANDBY',
    agitationScore: 0, // 0 to 100%
    eyebrowTension: 0, // 0 to 1
    mouthOpen: false,
    smileApproximation: 0, // 0 to 1
    isHeadShaking: false,
    isSquinting: false,
    headMovement: 'low', // 'low' | 'medium' | 'high'
    facialActivity: 0, // 0 to 1
    opticalStatus: 'STANDBY',
  });

  // Current raw landmarks for canvas overlay
  const [landmarks, setLandmarks] = useState(null);

  // References for tracking loop and MediaPipe instance
  const landmarkerRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const isRunningRef = useRef(false);

  // Baseline calibration state & buffers
  const isCalibratedRef = useRef(false);
  const baselineBufferRef = useRef([]);
  const baselineRef = useRef({
    avgActivity: 0.08,
    avgHeadMovement: 0.01,
    avgBrowSep: 0.22,
    avgBrowEyeDist: 0.10,
    avgSmile: 0.08,
    avgMouthRatio: 0.04,
    avgEyeAperture: 0.035,
    avgInnerBrowSep: 0.12,
    avgInnerBrowToNose: 0.07,
  });
  const baselineStartTimeRef = useRef(null);

  // Movement calculation history
  const lastNosePosRef = useRef(null);
  const recentDeltasRef = useRef([]);
  const recentXVelocitiesRef = useRef([]);
  const lastStateUpdateTimeRef = useRef(0);
  const smoothedTensionRef = useRef(0);

  // Force recalibrate method (can be triggered by user)
  const recalibrate = useCallback(() => {
    isCalibratedRef.current = false;
    setBaselineReady(false);
    baselineBufferRef.current = [];
    baselineStartTimeRef.current = Date.now();
    smoothedTensionRef.current = 0;
  }, []);

  // 1. Initialize FaceLandmarker with robust local-first fallback
  useEffect(() => {
    let isCancelled = false;

    async function initLandmarker() {
      if (landmarkerRef.current) return;
      setIsModelLoading(true);
      setModelError(null);

      try {
        // Try local WASM first, fallback to exact matching CDN version (0.10.14)
        let vision;
        try {
          vision = await FilesetResolver.forVisionTasks('/wasm');
        } catch (localWasmErr) {
          console.warn('Local WASM resolver failed, falling back to CDN:', localWasmErr);
          vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
          );
        }

        if (isCancelled) return;

        // Try local model first with GPU delegate, fallback to local model CPU, then remote
        let landmarker;
        try {
          landmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: '/models/face_landmarker.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numFaces: 1,
            outputFaceBlendshapes: false,
            outputFacialTransformationMatrixes: false,
          });
        } catch (gpuErr) {
          console.warn('GPU landmarker init failed, falling back to CPU delegate:', gpuErr);
          try {
            landmarker = await FaceLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: '/models/face_landmarker.task',
                delegate: 'CPU',
              },
              runningMode: 'VIDEO',
              numFaces: 1,
            });
          } catch (cpuErr) {
            console.warn('Local model CPU failed, trying CDN model:', cpuErr);
            landmarker = await FaceLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                delegate: 'CPU',
              },
              runningMode: 'VIDEO',
              numFaces: 1,
            });
          }
        }

        if (isCancelled) {
          landmarker?.close();
          return;
        }

        landmarkerRef.current = landmarker;
        setIsModelLoading(false);
      } catch (err) {
        console.error('Failed to initialize FaceLandmarker:', err);
        if (!isCancelled) {
          setModelError('Could not load Face Landmark model: ' + (err.message || 'Unknown error'));
          setIsModelLoading(false);
        }
      }
    }

    initLandmarker();

    return () => {
      isCancelled = true;
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch (e) {
          console.warn('Error closing landmarker:', e);
        }
        landmarkerRef.current = null;
      }
    };
  }, []);

  // 2. Optical Heuristics & Multi-Expression Classifier Helper
  const computeHeuristics = useCallback((points) => {
    const pForehead = points[10];
    const pChin = points[152];
    const pNose = points[1];
    const pNoseBridge = points[168];

    // Anatomically correct eyebrow landmarks (FACS AU4 & AU1/AU2):
    // Inner brow tips (corrugator supercilii contraction points):
    const pBrowInnerR = points[107]; // Right inner brow (subject's right, screen left)
    const pBrowInnerL = points[336]; // Left inner brow (subject's left, screen right)

    // Mid-brow arch points (directly above pupil):
    const pBrowMidR = points[66] || points[105];
    const pBrowMidL = points[296] || points[334];

    // Eyelid points:
    const pEyeTopR = points[159]; // Right eye upper lid
    const pEyeBotR = points[145]; // Right eye lower lid
    const pEyeTopL = points[386]; // Left eye upper lid
    const pEyeBotL = points[374]; // Left eye lower lid

    // Mouth points:
    const pUpperLip = points[13];
    const pLowerLip = points[14];
    const pMouthL = points[61];
    const pMouthR = points[291];

    if (!pForehead || !pChin || !pNose || !pUpperLip || !pLowerLip) {
      return {
        mouthOpen: false,
        smileApproximation: 0,
        eyebrowTension: 0,
        isHeadShaking: false,
        isSquinting: false,
        headMovement: 'low',
        facialActivity: 0,
        primaryExpression: 'SEARCHING',
        agitationScore: 0,
        rawHeadMovement: 0,
        innerBrowSep: 0.12,
        browEyeDist: 0.08,
        innerBrowToNose: 0.07,
      };
    }

    // Face height normalization metric (distance from chin to forehead)
    const faceHeight = Math.hypot(pChin.x - pForehead.x, pChin.y - pForehead.y) || 0.3;

    // 1. Mouth opening heuristic
    const mouthHeight = Math.hypot(pUpperLip.x - pLowerLip.x, pUpperLip.y - pLowerLip.y);
    const mouthRatio = mouthHeight / faceHeight;
    const baseMouthRatio = baselineRef.current.avgMouthRatio || 0.04;
    const mouthOpen = mouthRatio > Math.max(0.08, baseMouthRatio * 1.7);

    // 2. Smile approximation heuristic (mouth width vs height and corner lift)
    let smileApproximation = 0;
    if (pMouthL && pMouthR) {
      const mouthWidth = Math.hypot(pMouthR.x - pMouthL.x, pMouthR.y - pMouthL.y);
      const smileRatio = mouthWidth / faceHeight;
      const baseSmile = baselineRef.current.avgSmile || 0.28;
      const cornerLift = ((pUpperLip.y - pMouthL.y) + (pUpperLip.y - pMouthR.y)) / 2 / faceHeight;
      smileApproximation = Math.min(1, Math.max(0, (smileRatio - baseSmile) / 0.12 + (cornerLift > 0.015 ? cornerLift * 4 : 0)));
    }

    // 3. Eyebrow Separation & Vertical Distance Measurements
    let innerBrowSep = 0.12;
    if (pBrowInnerL && pBrowInnerR) {
      innerBrowSep = Math.hypot(pBrowInnerL.x - pBrowInnerR.x, pBrowInnerL.y - pBrowInnerR.y) / faceHeight;
    }

    let browEyeDist = 0.08;
    if (pBrowMidL && pBrowMidR && pEyeTopL && pEyeTopR) {
      // In normalized image coords, eye is below brow (pEyeTop.y > pBrowMid.y)
      const distL = Math.max(0.005, pEyeTopL.y - pBrowMidL.y) / faceHeight;
      const distR = Math.max(0.005, pEyeTopR.y - pBrowMidR.y) / faceHeight;
      browEyeDist = (distL + distR) / 2;
    }

    let innerBrowToNose = 0.07;
    if (pBrowInnerL && pBrowInnerR && pNoseBridge) {
      const distL = Math.hypot(pBrowInnerL.x - pNoseBridge.x, pBrowInnerL.y - pNoseBridge.y) / faceHeight;
      const distR = Math.hypot(pBrowInnerR.x - pNoseBridge.x, pBrowInnerR.y - pNoseBridge.y) / faceHeight;
      innerBrowToNose = (distL + distR) / 2;
    }

    // 4. Eye squinting / strain heuristic
    let isSquinting = false;
    let avgAperture = 0.035;
    if (pEyeTopL && pEyeBotL && pEyeTopR && pEyeBotR) {
      const leftAperture = Math.hypot(pEyeTopL.x - pEyeBotL.x, pEyeTopL.y - pEyeBotL.y) / faceHeight;
      const rightAperture = Math.hypot(pEyeTopR.x - pEyeBotR.x, pEyeTopR.y - pEyeBotR.y) / faceHeight;
      avgAperture = (leftAperture + rightAperture) / 2;
      const baseAperture = baselineRef.current.avgEyeAperture || 0.035;
      isSquinting = avgAperture < baseAperture * 0.70;
    }

    // 5. Head movement & Head Shake detection
    let rawHeadMovement = 0;
    let isHeadShaking = false;
    if (lastNosePosRef.current) {
      const dx = pNose.x - lastNosePosRef.current.x;
      const dy = pNose.y - lastNosePosRef.current.y;
      rawHeadMovement = Math.hypot(dx, dy) / faceHeight;

      // Track horizontal velocity history for head shake detection (reversals in sign)
      const xVels = recentXVelocitiesRef.current;
      xVels.push({ dx, time: Date.now() });
      if (xVels.length > 18) xVels.shift();

      // Count sign reversals within the last 420ms with non-trivial velocity
      const recent = xVels.filter((v) => Date.now() - v.time <= 420 && Math.abs(v.dx) > 0.005);
      let reversals = 0;
      for (let i = 1; i < recent.length; i++) {
        if (Math.sign(recent[i].dx) !== Math.sign(recent[i - 1].dx)) {
          reversals++;
        }
      }
      if (reversals >= 3) {
        isHeadShaking = true;
      }
    }
    lastNosePosRef.current = { x: pNose.x, y: pNose.y };

    let headMovement = 'low';
    if (rawHeadMovement > 0.048) {
      headMovement = 'high';
    } else if (rawHeadMovement > 0.016) {
      headMovement = 'medium';
    }

    // 6. Eyebrow Tension & Furrowed Brow Heuristic (RELATIVE TO PERSONAL BASELINE)
    let eyebrowTension = 0;
    let eyebrowsRaised = false;

    if (isCalibratedRef.current) {
      const baseSep = baselineRef.current.avgInnerBrowSep || innerBrowSep;
      const baseDist = baselineRef.current.avgBrowEyeDist || browEyeDist;
      const baseNose = baselineRef.current.avgInnerBrowToNose || innerBrowToNose;

      const sepRatio = innerBrowSep / baseSep;
      const distRatio = browEyeDist / baseDist;
      const noseRatio = innerBrowToNose / baseNose;

      // UP EYEBROWS / RAISED BROWS (AU1/AU2):
      // Distance between eyebrows and eyes expands noticeably (>12% higher than resting baseline)
      if (distRatio > 1.12 || (distRatio > 1.08 && noseRatio > 1.08)) {
        eyebrowsRaised = true;
        eyebrowTension = 0; // Raising eyebrows is relaxed/inquisitive, never tension!
      } else {
        // FURROWED BROW / ANNOYANCE (AU4):
        // Genuine brow furrowing requires inner eyebrows to contract inward toward each other
        // AND pull down toward eyes / nose bridge.
        const sepDrop = Math.max(0, (0.91 - sepRatio) / 0.16);   // Inward contraction
        const distDrop = Math.max(0, (0.89 - distRatio) / 0.16); // Vertical drop to eyes
        const noseDrop = Math.max(0, (0.89 - noseRatio) / 0.16); // Vertical drop to nose bridge

        const vertDrop = Math.max(distDrop, noseDrop);

        // Brow furrowing requires BOTH inward contraction (sepDrop > 0) AND vertical pull (vertDrop > 0)
        // This strictly prevents resting faces, head tilts, or blinks from triggering false tension.
        if (sepDrop > 0.05 && vertDrop > 0.05) {
          eyebrowTension = Math.min(1, (sepDrop * 0.55) + (vertDrop * 0.45));
        } else if (sepDrop > 0.45) {
          // Intense inward pinch
          eyebrowTension = Math.min(1, sepDrop * 0.85);
        } else {
          // Normal resting face: zero tension
          eyebrowTension = 0;
        }

        // Clamping noise floor: anything under 15% is completely relaxed
        if (eyebrowTension < 0.15) {
          eyebrowTension = 0;
        }
      }
    }

    // 7. Facial activity index (sum of movement + tension)
    const deltas = recentDeltasRef.current;
    deltas.push(rawHeadMovement + (eyebrowTension * 0.06) + (mouthOpen ? 0.04 : 0));
    if (deltas.length > 15) deltas.shift();

    const avgDelta = deltas.reduce((a, b) => a + b, 0) / (deltas.length || 1);
    const facialActivity = Math.min(1, Math.max(0, avgDelta * 11));

    // 8. Composite Expression Classification
    let primaryExpression = 'NEUTRAL';
    if (!isCalibratedRef.current) {
      primaryExpression = 'CALIBRATING (RESTING FACE)';
    } else if (smileApproximation > 0.55) {
      primaryExpression = 'SMILING / AMUSED';
    } else if (isHeadShaking) {
      primaryExpression = 'HEAD SHAKE (DISAPPROVAL)';
    } else if (eyebrowsRaised) {
      primaryExpression = 'SURPRISED / RAISED BROWS';
    } else if (eyebrowTension > 0.40) {
      primaryExpression = 'FURROWED BROW (ANNOYED)';
    } else if (mouthOpen && mouthRatio > 0.15) {
      primaryExpression = 'EXASPERATED / MOUTH OPEN';
    } else if (isSquinting) {
      primaryExpression = 'SQUINTING / STRAINED';
    } else if (headMovement === 'high') {
      primaryExpression = 'AGITATED / RESTLESS';
    }

    // 9. Composite Agitation Score (0 - 100%)
    let agitationScore = 0;
    if (isCalibratedRef.current) {
      agitationScore = Math.min(
        100,
        Math.round(
          (eyebrowTension * 55) +
          (facialActivity * 20) +
          (isHeadShaking ? 25 : 0) +
          (mouthOpen && mouthRatio > 0.12 ? 15 : 0) +
          (isSquinting ? 10 : 0)
        )
      );
    }

    return {
      mouthOpen,
      mouthRatio,
      smileApproximation: Math.round(smileApproximation * 100) / 100,
      eyebrowTension: Math.round(eyebrowTension * 100) / 100,
      eyebrowsRaised,
      isHeadShaking,
      isSquinting,
      headMovement,
      facialActivity: Math.round(facialActivity * 100) / 100,
      primaryExpression,
      agitationScore,
      rawHeadMovement,
      innerBrowSep,
      browEyeDist,
      innerBrowToNose,
      eyeAperture: avgAperture,
    };
  }, []);

  // 3. Main Video Tracking Loop
  useEffect(() => {
    if (!isStreaming || !videoRef.current) {
      isRunningRef.current = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      setLandmarks(null);
      isCalibratedRef.current = false;
      setBaselineReady(false);
      baselineBufferRef.current = [];
      baselineStartTimeRef.current = null;
      setTelemetry((prev) => ({
        ...prev,
        faceDetected: false,
        facesCount: 0,
        primaryExpression: 'OFFLINE',
        expressionLabel: 'OFFLINE',
        agitationScore: 0,
        opticalStatus: 'OFFLINE',
      }));
      return;
    }

    isRunningRef.current = true;
    baselineStartTimeRef.current = Date.now();

    const loop = () => {
      if (!isRunningRef.current) return;

      const video = videoRef.current;
      const landmarker = landmarkerRef.current;

      if (
        video &&
        video.readyState >= 2 &&
        landmarker &&
        video.currentTime !== lastVideoTimeRef.current
      ) {
        lastVideoTimeRef.current = video.currentTime;
        const nowMs = performance.now();

        try {
          const results = landmarker.detectForVideo(video, nowMs);

          if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
            const facePoints = results.faceLandmarks[0];
            setLandmarks(facePoints);

            const heuristics = computeHeuristics(facePoints);

            // Baseline calibration logic (first 1.2s of detected face)
            if (!isCalibratedRef.current) {
              baselineBufferRef.current.push(heuristics);

              // On the very first frame, seed baseline immediately with user's actual measurements
              if (baselineBufferRef.current.length === 1) {
                baselineRef.current = {
                  avgActivity: heuristics.facialActivity || 0.08,
                  avgHeadMovement: heuristics.rawHeadMovement || 0.01,
                  avgInnerBrowSep: heuristics.innerBrowSep || 0.12,
                  avgBrowEyeDist: heuristics.browEyeDist || 0.08,
                  avgInnerBrowToNose: heuristics.innerBrowToNose || 0.07,
                  avgSmile: heuristics.smileApproximation || 0.28,
                  avgMouthRatio: heuristics.mouthRatio || 0.04,
                  avgEyeAperture: heuristics.eyeAperture || 0.035,
                };
              }

              const elapsed = Date.now() - (baselineStartTimeRef.current || Date.now());
              if (elapsed >= 1200 && baselineBufferRef.current.length >= 8) {
                const buf = baselineBufferRef.current;
                const avgAct = buf.reduce((s, h) => s + h.facialActivity, 0) / buf.length;
                const avgHead = buf.reduce((s, h) => s + (h.rawHeadMovement || 0.01), 0) / buf.length;
                const avgSep = buf.reduce((s, h) => s + (h.innerBrowSep || 0.12), 0) / buf.length;
                const avgDist = buf.reduce((s, h) => s + (h.browEyeDist || 0.08), 0) / buf.length;
                const avgNose = buf.reduce((s, h) => s + (h.innerBrowToNose || 0.07), 0) / buf.length;
                const avgSmile = buf.reduce((s, h) => s + (h.smileApproximation || 0), 0) / buf.length;
                const avgMouth = buf.reduce((s, h) => s + (h.mouthRatio || 0.04), 0) / buf.length;
                const avgEye = buf.reduce((s, h) => s + (h.eyeAperture || 0.035), 0) / buf.length;

                baselineRef.current = {
                  avgActivity: avgAct,
                  avgHeadMovement: avgHead,
                  avgInnerBrowSep: avgSep,
                  avgBrowEyeDist: avgDist,
                  avgInnerBrowToNose: avgNose,
                  avgSmile,
                  avgMouthRatio: avgMouth,
                  avgEyeAperture: avgEye,
                };

                isCalibratedRef.current = true;
                setBaselineReady(true);
              }
            } else {
              // Continuous adaptive resting calibration:
              // When the face is calm and resting (still head, mouth closed, not shaking, zero tension),
              // gently adapt resting baseline (~1% per frame) so resting faces ALWAYS calibrate to 0% tension!
              if (
                heuristics.rawHeadMovement < 0.02 &&
                !heuristics.mouthOpen &&
                !heuristics.isHeadShaking &&
                !heuristics.eyebrowsRaised &&
                heuristics.eyebrowTension === 0
              ) {
                const alpha = 0.012;
                baselineRef.current.avgInnerBrowSep =
                  baselineRef.current.avgInnerBrowSep * (1 - alpha) + heuristics.innerBrowSep * alpha;
                baselineRef.current.avgBrowEyeDist =
                  baselineRef.current.avgBrowEyeDist * (1 - alpha) + heuristics.browEyeDist * alpha;
                baselineRef.current.avgInnerBrowToNose =
                  baselineRef.current.avgInnerBrowToNose * (1 - alpha) + heuristics.innerBrowToNose * alpha;
              }
            }

            // Throttle React state telemetry updates to ~12 updates/sec for smooth rendering
            const nowTime = Date.now();
            if (nowTime - lastStateUpdateTimeRef.current >= 80) {
              lastStateUpdateTimeRef.current = nowTime;

              // Smooth tension transitions and clamp noise floor below 15% to zero
              smoothedTensionRef.current = (smoothedTensionRef.current * 0.6) + (heuristics.eyebrowTension * 0.4);
              const cleanTension = smoothedTensionRef.current < 0.15 ? 0 : Math.round(smoothedTensionRef.current * 100) / 100;

              setTelemetry({
                faceDetected: true,
                facesCount: results.faceLandmarks.length,
                primaryExpression: heuristics.primaryExpression,
                expressionLabel: heuristics.primaryExpression,
                agitationScore: heuristics.agitationScore,
                eyebrowTension: cleanTension,
                eyebrowsRaised: heuristics.eyebrowsRaised,
                mouthOpen: heuristics.mouthOpen,
                smileApproximation: heuristics.smileApproximation,
                isHeadShaking: heuristics.isHeadShaking,
                isSquinting: heuristics.isSquinting,
                headMovement: heuristics.headMovement,
                facialActivity: heuristics.facialActivity,
                opticalStatus: 'ONLINE',
              });
            }
          } else {
            setLandmarks(null);
            const nowTime = Date.now();
            if (nowTime - lastStateUpdateTimeRef.current >= 120) {
              lastStateUpdateTimeRef.current = nowTime;
              setTelemetry((prev) => ({
                ...prev,
                faceDetected: false,
                facesCount: 0,
                primaryExpression: 'SEARCHING FOR FACE',
                expressionLabel: 'SEARCHING FOR FACE',
                agitationScore: 0,
                opticalStatus: 'SEARCHING FOR FACE',
              }));
            }
          }
        } catch (err) {
          console.warn('FaceLandmarker detect error:', err);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      isRunningRef.current = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isStreaming, videoRef, computeHeuristics]); // baselineReady is NOT here, so it never resets loop!

  return {
    isModelLoading,
    modelError,
    baselineReady,
    telemetry,
    landmarks,
    baseline: baselineRef.current,
    recalibrate,
  };
}

export default useFaceTracking;
