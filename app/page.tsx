"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useTeleprompterEngine } from "@/hooks/useTeleprompterEngine";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useInactivityFade } from "@/hooks/useInactivityFade";
import { useRecorder } from "@/hooks/useRecorder";
import { calculateCurrentWPM } from "@/lib/wpm";
import { Sidebar } from "@/components/layout/Sidebar";
import { FloatingControls } from "@/components/layout/FloatingControls";
import { ScriptStage } from "@/components/stage/ScriptStage";
import { CameraFeed } from "@/components/camera/CameraFeed";
import { PiPWindow } from "@/components/pip/PiPWindow";

export default function Home() {
  const script = useAppStore((s) => s.script);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const setIsPlaying = useAppStore((s) => s.setIsPlaying);
  const togglePlaying = useAppStore((s) => s.togglePlaying);
  const targetWPM = useAppStore((s) => s.targetWPM);
  const setTargetWPM = useAppStore((s) => s.setTargetWPM);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const isCameraOn = useAppStore((s) => s.isCameraOn);
  const setIsCameraOn = useAppStore((s) => s.setIsCameraOn);
  const isMirrored = useAppStore((s) => s.isMirrored);
  const toggleMirrored = useAppStore((s) => s.toggleMirrored);
  const isRecording = useAppStore((s) => s.isRecording);
  const setIsRecording = useAppStore((s) => s.setIsRecording);
  const pipOpen = useAppStore((s) => s.pipOpen);
  const setPipOpen = useAppStore((s) => s.setPipOpen);
  const pipUrl = useAppStore((s) => s.pipUrl);
  const setPipUrl = useAppStore((s) => s.setPipUrl);

  const engine = useTeleprompterEngine(script, targetWPM, isPlaying);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const recorder = useRecorder(cameraStream);

  const controlsVisible = useInactivityFade(3000);

  const currentWPM = useMemo(
    () => calculateCurrentWPM(Math.floor(engine.currentWordIndex), engine.activeElapsedMs, targetWPM),
    [engine.currentWordIndex, engine.activeElapsedMs, targetWPM]
  );

  // Auto-pause once the script is fully read.
  useEffect(() => {
    if (engine.isFinished && isPlaying) setIsPlaying(false);
  }, [engine.isFinished, isPlaying, setIsPlaying]);

  const handlePlayPause = useCallback(() => {
    if (!script.trim()) return;
    togglePlaying();
  }, [script, togglePlaying]);

  const handleRecordToggle = useCallback(() => {
    if (!isCameraOn) return;
    if (isRecording) {
      recorder.stop();
      setIsRecording(false);
    } else {
      recorder.start();
      setIsRecording(true);
    }
  }, [isCameraOn, isRecording, recorder, setIsRecording]);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    engine.reset();
    if (isRecording) {
      recorder.stop();
      setIsRecording(false);
    }
  }, [engine, isRecording, recorder, setIsPlaying, setIsRecording]);

  useKeyboardShortcuts({
    onPlayPause: handlePlayPause,
    onRecordToggle: handleRecordToggle,
    onStop: handleStop,
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 text-white">
      <Sidebar open={sidebarOpen} />

      <main className="relative flex-1 bg-black">
        {/* Camera fills the stage — the user's reflection is the focal point.
            `mirrored` only flips the live preview (see FloatingControls'
            "Mirror view"/"True view" toggle); recordings are always saved
            in the camera's true, unmirrored orientation. */}
        <CameraFeed enabled={isCameraOn} mirrored={isMirrored} onStreamChange={setCameraStream} />

        {/* Script overlays the bottom third when the camera is on (karaoke-style,
            over a semi-transparent gradient); falls back to a full centered stage
            when there's no video behind it to protect legibility for. */}
        <ScriptStage
          paragraphWords={engine.paragraphWords}
          currentParagraphIndex={engine.currentParagraphIndex}
          wordInParagraphIndex={engine.wordInParagraphIndex}
          variant={isCameraOn ? "overlay" : "stage"}
        />

        {pipOpen && <PiPWindow url={pipUrl} onUrlChange={setPipUrl} onClose={() => setPipOpen(false)} />}

        {recorder.downloadUrl && (
          <a
            href={recorder.downloadUrl}
            download="innerview-rehearsal.mp4"
            className="absolute right-6 top-6 z-30 rounded-full bg-emerald-500 px-4 py-2 text-xs font-medium text-black shadow-lg hover:bg-emerald-400"
          >
            Download recording (MP4)
          </a>
        )}

        {recorder.error && (
          <div className="absolute right-6 top-16 z-30 max-w-xs rounded-md bg-red-950/80 px-3 py-2 text-xs text-red-200">
            {recorder.error}
          </div>
        )}

        <FloatingControls
          visible={controlsVisible}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          progressPercent={engine.progressPercent}
          currentWPM={currentWPM}
          targetWPM={targetWPM}
          onTargetWPMChange={setTargetWPM}
          isCameraOn={isCameraOn}
          onToggleCamera={() => setIsCameraOn(!isCameraOn)}
          isMirrored={isMirrored}
          onToggleMirrored={toggleMirrored}
          isRecording={isRecording}
          isProcessing={recorder.isProcessing}
          onToggleRecord={handleRecordToggle}
          pipOpen={pipOpen}
          onTogglePip={() => setPipOpen(!pipOpen)}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
        />
      </main>
    </div>
  );
}
