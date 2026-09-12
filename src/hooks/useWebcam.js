import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * useWebcam Hook — Step 4 Local Browser Webcam Management
 * 
 * Strict Restrictions:
 * - NO MICROPHONE: audio is explicitly set to false.
 * - NO VOICE / CLOUD: everything is local.
 * - Complete lifecycle management: start, stop, cleanup on unmount.
 */
export function useWebcam() {
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'unavailable' | 'unsupported'
  const [errorMessage, setErrorMessage] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStream(null);
    setIsStreaming(false);
    setIsLoading(false);
  }, []);

  const startWebcam = useCallback(async () => {
    // 1. Check browser compatibility
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionState('unsupported');
      setErrorMessage('Browser does not support mediaDevices.getUserMedia.');
      return;
    }

    // Stop any existing stream before starting a new one
    stopWebcam();

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // STRICT REQUIREMENT: video: true, audio: false (NO MICROPHONE)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch((err) => {
          console.warn('Video play interrupted or auto-play restricted:', err);
        });
      }

      setPermissionState('granted');
      setIsStreaming(true);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setIsStreaming(false);
      streamRef.current = null;

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.name === 'SecurityError') {
        setPermissionState('denied');
        setErrorMessage('Camera access denied by user or system policy.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionState('unavailable');
        setErrorMessage('No camera device found on this system.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setPermissionState('unavailable');
        setErrorMessage('Camera is currently in use by another application.');
      } else if (err.name === 'OverconstrainedError') {
        setPermissionState('unavailable');
        setErrorMessage('Camera does not support the requested video constraints.');
      } else {
        setPermissionState('unavailable');
        setErrorMessage(err.message || 'Unknown camera error.');
      }
    }
  }, [stopWebcam]);

  // Cleanup: CRITICAL REQUIREMENT — STOP ALL MEDIA TRACKS on unmount!
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return {
    videoRef,
    stream,
    isLoading,
    isStreaming,
    permissionState,
    errorMessage,
    startWebcam,
    stopWebcam,
  };
}

export default useWebcam;
