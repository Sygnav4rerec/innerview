"use client";

import { useEffect, useMemo, useState } from "react";
import { locateProgress, splitParagraphs, splitWords } from "@/lib/script";

export interface TeleprompterEngine {
  paragraphs: string[];
  paragraphWords: string[][];
  totalWords: number;
  currentWordIndex: number; // fractional global word position
  currentParagraphIndex: number;
  wordInParagraphIndex: number;
  activeElapsedMs: number;
  progressPercent: number;
  isFinished: boolean;
  reset: () => void;
}

/**
 * Drives playback position from real elapsed time at the target pace
 * (msPerWord = 60000 / targetWPM), using requestAnimationFrame so it stays
 * smooth and only advances while actually playing — paused time is never
 * counted, which is what makes the WPM readout (lib/wpm.ts) trustworthy.
 *
 * The per-frame timestamp/word-index tracking lives entirely in plain
 * variables closed over inside the animation effect (not refs) — a fresh
 * pair is created every time the effect (re)starts, which is exactly the
 * "start the pace clock over" behavior we want on play/pause/pace changes.
 */
export function useTeleprompterEngine(
  script: string,
  targetWPM: number,
  isPlaying: boolean
): TeleprompterEngine {
  const paragraphs = useMemo(() => splitParagraphs(script), [script]);
  const paragraphWords = useMemo(() => paragraphs.map(splitWords), [paragraphs]);
  const totalWords = useMemo(
    () => paragraphWords.reduce((sum, words) => sum + words.length, 0),
    [paragraphWords]
  );

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [activeElapsedMs, setActiveElapsedMs] = useState(0);

  const reset = () => {
    setCurrentWordIndex(0);
    setActiveElapsedMs(0);
  };

  // Reset playback position whenever the script itself changes. Adjusted
  // directly during render (React's documented pattern for "resetting state
  // when a prop changes") rather than in an effect, so there's no extra
  // render flash and no synchronous setState inside a useEffect body.
  const [scriptAtLastReset, setScriptAtLastReset] = useState(script);
  if (script !== scriptAtLastReset) {
    setScriptAtLastReset(script);
    setCurrentWordIndex(0);
    setActiveElapsedMs(0);
  }

  useEffect(() => {
    if (!isPlaying) return;

    const msPerWord = 60000 / Math.max(targetWPM, 1);
    let lastTimestamp: number | null = null;
    let shouldContinue = true;
    let raf = 0;

    const tick = (now: number) => {
      if (lastTimestamp == null) lastTimestamp = now;
      const delta = now - lastTimestamp;
      lastTimestamp = now;

      setActiveElapsedMs((prev) => prev + delta);
      setCurrentWordIndex((prev) => {
        const next = Math.min(prev + delta / msPerWord, totalWords);
        shouldContinue = next < totalWords;
        return next;
      });

      if (shouldContinue) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, targetWPM, totalWords]);

  const paragraphWordCounts = useMemo(() => paragraphWords.map((words) => words.length), [paragraphWords]);
  const { paragraphIndex: currentParagraphIndex, wordIndex: wordInParagraphIndex } = useMemo(
    () => locateProgress(currentWordIndex, paragraphWordCounts),
    [currentWordIndex, paragraphWordCounts]
  );

  const progressPercent = totalWords > 0 ? (currentWordIndex / totalWords) * 100 : 0;
  const isFinished = totalWords > 0 && currentWordIndex >= totalWords;

  return {
    paragraphs,
    paragraphWords,
    totalWords,
    currentWordIndex,
    currentParagraphIndex,
    wordInParagraphIndex,
    activeElapsedMs,
    progressPercent,
    isFinished,
    reset,
  };
}
