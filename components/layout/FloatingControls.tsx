"use client";

import { ProgressBar } from "@/components/stage/ProgressBar";
import { WPMBadge } from "@/components/stage/WPMBadge";
import { RecordButton } from "@/components/recording/RecordButton";

interface FloatingControlsProps {
  visible: boolean;
  isPlaying: boolean;
  onPlayPause: () => void;
  progressPercent: number;
  currentWPM: number;
  targetWPM: number;
  onTargetWPMChange: (wpm: number) => void;
  isCameraOn: boolean;
  onToggleCamera: () => void;
  isMirrored: boolean;
  onToggleMirrored: () => void;
  isRecording: boolean;
  isProcessing: boolean;
  onToggleRecord: () => void;
  pipOpen: boolean;
  onTogglePip: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

/**
 * All playback/recording/reference controls, grouped in one floating bar
 * that fades out after 3s of inactivity (see useInactivityFade) so the
 * stage stays distraction-free. Pinned to the top of the stage so the
 * bottom stays clear for the script overlay.
 */
export function FloatingControls(props: FloatingControlsProps) {
  const {
    visible,
    isPlaying,
    onPlayPause,
    progressPercent,
    currentWPM,
    targetWPM,
    onTargetWPMChange,
    isCameraOn,
    onToggleCamera,
    isMirrored,
    onToggleMirrored,
    isRecording,
    isProcessing,
    onToggleRecord,
    pipOpen,
    onTogglePip,
    sidebarOpen,
    onToggleSidebar,
  } = props;

  return (
    <div
      className={[
        "pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-3 p-4 transition-opacity duration-500 md:p-6",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <div className="pointer-events-auto mx-auto w-full max-w-3xl">
        <ProgressBar percent={progressPercent} />
      </div>

      <div className="pointer-events-auto mx-auto flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-black/50 px-4 py-3 backdrop-blur-md">
        <button
          onClick={onToggleSidebar}
          className="rounded-full bg-white/10 px-3 py-2 text-xs text-neutral-200 hover:bg-white/20"
        >
          {sidebarOpen ? "Hide script" : "Show script"}
        </button>

        <button
          onClick={onPlayPause}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>

        <WPMBadge currentWPM={currentWPM} targetWPM={targetWPM} />

        <div className="flex items-center gap-2 text-xs text-neutral-300">
          <span>Pace</span>
          <input
            type="range"
            min={100}
            max={220}
            value={targetWPM}
            onChange={(e) => onTargetWPMChange(Number(e.target.value))}
            className="accent-white"
          />
        </div>

        <button
          onClick={onToggleCamera}
          className={`rounded-full px-3 py-2 text-xs ${
            isCameraOn ? "bg-white/20 text-white" : "bg-white/10 text-neutral-300"
          } hover:bg-white/20`}
        >
          {isCameraOn ? "Camera on" : "Camera off"}
        </button>

        <button
          onClick={onToggleMirrored}
          disabled={!isCameraOn}
          title="Recording always captures the true (unmirrored) orientation, regardless of this toggle"
          className={`rounded-full px-3 py-2 text-xs ${
            isCameraOn ? "bg-white/10 text-neutral-300 hover:bg-white/20" : "cursor-not-allowed bg-white/5 text-neutral-500"
          }`}
        >
          {isMirrored ? "Mirror view" : "True view"}
        </button>

        <RecordButton
          isRecording={isRecording}
          isProcessing={isProcessing}
          disabled={!isCameraOn}
          onToggle={onToggleRecord}
        />

        <button
          onClick={onTogglePip}
          className={`rounded-full px-3 py-2 text-xs ${
            pipOpen ? "bg-white/20 text-white" : "bg-white/10 text-neutral-300"
          } hover:bg-white/20`}
        >
          {pipOpen ? "Hide reference" : "Reference video"}
        </button>
      </div>
    </div>
  );
}
