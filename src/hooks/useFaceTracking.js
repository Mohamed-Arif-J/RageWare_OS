import { useState, useRef, useEffect, useCallback } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

/**
 * useFaceTracking Hook — Step 4 Local MediaPipe Face Landmark Detection
 * 
 * Strict Guidelines:
 * - Single face tracking using local MediaPipe Tasks Vision.
 * - Approximate optical heuristics (mouth opening, smile approximation, head movement, facial activity).
 * - NOT claiming emotion recognition (NO "ANGER DETECTED").
 * - Baseline calibration for initial 1.5–2 seconds.
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
    mouthOpen: false,
    smileApproximation: 0,
    headMovement: 'low', // 'low' | 'medium' | 'high'
    facialActivity: 0, // 0 to 1
    opticalStatus: 'STANDBY',
  });

  // Current raw landmarks for canvas overlay (mirrored coordinate space)
  const [landmarks, setLandmarks] = useState(null);

  // References for tracking loop and MediaPipe instance
  const landmarkerRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const isRunningRef = useRef(false);

  // Baseline calibration buffers
  const baselineBufferRef = useRef([]);
  const baselineRef = useRef({ avgActivity: 0.1, avgHeadMovement: 0.01 });
  const baselineStartTimeRef = useRef(null);

  // Movement calculation history
  const lastNosePosRef = useRef(null);
  const recentDeltasRef = useRef([]);
  const lastStateUpdateTimeRef = useRef(0);

  // 1. Initialize FaceLandmarker with local fallback support
  useEffect(() => {
    let isCancelled = false;

    async function initLandmarker() {
      if (landmarkerRef.current) return;
      setIsModelLoading(true);
      setModelError(null);

      try {
        // Try local WASM first, fallback to CDN if needed
        let vision;
        try {
          vision = await FilesetResolver.forVisionTasks('/wasm');
        } catch {
          vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm'
          );
        }

        if (isCancelled) return;

        // Try local model first, fallback to Google Cloud storage
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
          console.warn('GPU landmarker init failed, falling back to CPU / CDN:', gpuErr);
          landmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numFaces: 1,
          });
        }

        if (isCancelled) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = landmarker;
        setIsModelLoading(false);
      } catch (err) {
        console.error('Failed to initialize FaceLandmarker:', err);
        if (!isCancelled) {
          setModelError('Could not load Face Landmark model.');
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

  // 2. Optical Heuristics Helper
  const computeHeuristics = useCallback((points) => {
    // Key landmark indices:
    // 10: Forehead top, 152: Chin bottom
    // 13: Upper lip center, 14: Lower lip center
    // 61: Left mouth corner, 291: Right mouth corner
    // 1: Nose tip
    // 70: Left eyebrow, 300: Right eyebrow

    const pForehead = points[10];
    const pChin = points[152];
    const pUpperLip = points[13];
    const pLowerLip = points[14];
    const pMouthL = points[61];
    const pMouthR = points[291];
    const pNose = points[1];

    if (!pForehead || !pChin || !pUpperLip || !pLowerLip || !pNose) {
      return {
        mouthOpen: false,
        smileApproximation: 0,
        headMovement: 'low',
        facialActivity: 0,
      };
    }

    // Face height normalization metric
    const faceHeight = Math.hypot(pChin.x - pForehead.x, pChin.y - pForehead.y) || 0.3;

    // 1. Mouth opening heuristic
    const mouthHeight = Math.hypot(pUpperLip.x - pLowerLip.x, pUpperLip.y - pLowerLip.y);
    const mouthRatio = mouthHeight / faceHeight;
    const mouthOpen = mouthRatio > 0.085;

    // 2. Smile approximation heuristic (mouth width vs height)
    let smileApproximation = 0;
    if (pMouthL && pMouthR) {
      const mouthWidth = Math.hypot(pMouthR.x - pMouthL.x, pMouthR.y - pMouthL.y);
      const smileRatio = mouthWidth / faceHeight;
      // Normal neutral ratio is ~0.26 - 0.32; wider mouth correlates with smile approx
      smileApproximation = Math.min(1, Math.max(0, (smileRatio - 0.28) / 0.18));
    }

    // 3. Head movement estimation (Nose position velocity)
    let rawHeadMovement = 0;
    if (lastNosePosRef.current) {
      const dx = pNose.x - lastNosePosRef.current.x;
      const dy = pNose.y - lastNosePosRef.current.y;
      rawHeadMovement = Math.hypot(dx, dy) / faceHeight;
    }
    lastNosePosRef.current = { x: pNose.x, y: pNose.y };

    let headMovement = 'low';
    if (rawHeadMovement > 0.055) {
      headMovement = 'high';
    } else if (rawHeadMovement > 0.02) {
      headMovement = 'medium';
    }

    // 4. Facial activity estimation (sum of recent movement deltas)
    const deltas = recentDeltasRef.current;
    deltas.push(rawHeadMovement + (mouthOpen ? 0.04 : 0));
    if (deltas.length > 15) deltas.shift();

    const avgDelta = deltas.reduce((a, b) => a + b, 0) / (deltas.length || 1);
    // Normalized 0 to 1 activity index
    const facialActivity = Math.min(1, Math.max(0, avgDelta * 12));

    return {
      mouthOpen,
      smileApproximation: Math.round(smileApproximation * 100) / 100,
      headMovement,
      facialActivity: Math.round(facialActivity * 100) / 100,
      rawHeadMovement,
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
      setBaselineReady(false);
      baselineBufferRef.current = [];
      baselineStartTimeRef.current = null;
      setTelemetry((prev) => ({
        ...prev,
        faceDetected: false,
        facesCount: 0,
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

            // Baseline collection: first 1.8 seconds of tracking
            const elapsed = Date.now() - (baselineStartTimeRef.current || Date.now());
            if (elapsed < 1800) {
              baselineBufferRef.current.push(heuristics);
            } else if (!baselineReady && baselineBufferRef.current.length > 5) {
              const buf = baselineBufferRef.current;
              const avgAct = buf.reduce((s, h) => s + h.facialActivity, 0) / buf.length;
              const avgHead = buf.reduce((s, h) => s + (h.rawHeadMovement || 0.01), 0) / buf.length;
              baselineRef.current = { avgActivity: avgAct, avgHeadMovement: avgHead };
              setBaselineReady(true);
            }

            // Throttle React state telemetry updates to ~10 updates/sec to prevent UI lag
            const nowTime = Date.now();
            if (nowTime - lastStateUpdateTimeRef.current >= 95) {
              lastStateUpdateTimeRef.current = nowTime;

              setTelemetry({
                faceDetected: true,
                facesCount: results.faceLandmarks.length,
                mouthOpen: heuristics.mouthOpen,
                smileApproximation: heuristics.smileApproximation,
                headMovement: heuristics.headMovement,
                facialActivity: heuristics.facialActivity,
                opticalStatus: 'ONLINE',
              });
            }
          } else {
            setLandmarks(null);
            const nowTime = Date.now();
            if (nowTime - lastStateUpdateTimeRef.current >= 150) {
              lastStateUpdateTimeRef.current = nowTime;
              setTelemetry((prev) => ({
                ...prev,
                faceDetected: false,
                facesCount: 0,
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
  }, [isStreaming, videoRef, computeHeuristics, baselineReady]);

  return {
    isModelLoading,
    modelError,
    baselineReady,
    telemetry,
    landmarks,
    baseline: baselineRef.current,
  };
}

export default useFaceTracking;
