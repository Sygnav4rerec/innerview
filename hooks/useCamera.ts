"use client";

import { useEffect, useRef, useState } from "react";

export interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  error: string | null;
  ready: boolean;
}

export function useCamera(enabled: boolean): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Acquisition + teardown live in one effect keyed on `enabled`: the setup
  // runs when the camera turns on, and the returned cleanup — which React
  // runs automatically when `enabled` flips off or the component unmounts —
  // stops the tracks. This keeps every setState call inside either an async
  // callback or the cleanup function, never synchronously in the effect body.
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let acquiredStream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720 }, audio: true })
      .then((mediaStream) => {
        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        acquiredStream = mediaStream;
        setError(null);
        setStream(mediaStream);
        setReady(true);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Camera access was denied");
        }
      });

    return () => {
      cancelled = true;
      acquiredStream?.getTracks().forEach((t) => t.stop());
      setStream(null);
      setReady(false);
    };
  }, [enabled]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return { videoRef, stream, error, ready };
}
