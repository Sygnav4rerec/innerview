"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
  onPlayPause: () => void;
  onRecordToggle: () => void;
  onStop: () => void;
}

/**
 * Space = Play/Pause, R = Record, Esc = Stop.
 * Critical: ignored whenever the event target is a text input, so typing a
 * space in the script textarea never toggles playback.
 */
export function useKeyboardShortcuts({ onPlayPause, onRecordToggle, onStop }: ShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTypingTarget =
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLInputElement ||
        Boolean(target?.isContentEditable);

      if (isTypingTarget) return;

      if (e.code === "Space") {
        e.preventDefault();
        onPlayPause();
      } else if (e.key === "r" || e.key === "R") {
        onRecordToggle();
      } else if (e.key === "Escape") {
        onStop();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onPlayPause, onRecordToggle, onStop]);
}
