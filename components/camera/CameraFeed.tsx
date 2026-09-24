"use client";

import { useEffect } from "react";
import { useCamera } from "@/hooks/useCamera";

interface CameraFeedProps {
  enabled: boolean;
  /**
   * true = mirrored (the familiar "looking in a mirror" view).
   * false = true orientation, matching how the camera — and everyone else —
   * actually sees you. Purely a CSS flip of the live preview; the
   * underlying MediaStream (and anything recorded from it) is untouched.
   */
  mirrored: boolean;
  onStreamChange?: (stream: MediaStream | null) => void;
}

/**
 * Camera feed as the full-stage background — the user's reflection is the
 * focal point. The script overlays on top of it in the bottom third (see
 * ScriptStage's "overlay" variant).
 */
export function CameraFeed({ enabled, mirrored, onStreamChange }: CameraFeedProps) {
  const { videoRef, stream, error, ready } = useCamera(enabled);

  useEffect(() => {
    onStreamChange?.(ready ? stream : null);
  }, [ready, stream, onStreamChange]);

  if (!enabled) return null;

  return (
    <div className="absolute inset-0 z-0 bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={["h-full w-full object-cover", mirrored ? "scale-x-[-1]" : ""].join(" ")}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-6 text-center text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
