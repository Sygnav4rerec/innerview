/**
 * Live WPM calculation — always derived from actual words read over actual
 * active (unpaused) elapsed time, never approximated from the pace slider.
 */
export function calculateCurrentWPM(
  wordsRead: number,
  activeElapsedMs: number,
  targetWPM: number
): number {
  if (wordsRead <= 0 || activeElapsedMs <= 0) return targetWPM;
  const minutes = activeElapsedMs / 60000;
  return Math.round(wordsRead / minutes);
}

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
