/**
 * Script parsing utilities.
 *
 * Scripts are split into paragraphs on blank lines (\n\s*\n). Each paragraph
 * is one "rehearsal beat" — the teleprompter advances and highlights one
 * paragraph at a time, word by word, based on elapsed time and target pace.
 */

export function splitParagraphs(script: string): string[] {
  return script
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function splitWords(paragraph: string): string[] {
  return paragraph.split(/\s+/).filter(Boolean);
}

export function countWords(text: string): number {
  return splitWords(text).length;
}

export interface ProgressLocation {
  paragraphIndex: number;
  wordIndex: number;
}

/**
 * Given a fractional global word position and the word count of each
 * paragraph, finds which paragraph is active and how many of its words have
 * been passed.
 */
export function locateProgress(currentWordIndex: number, paragraphWordCounts: number[]): ProgressLocation {
  let remaining = currentWordIndex;
  for (let p = 0; p < paragraphWordCounts.length; p++) {
    const len = paragraphWordCounts[p];
    const isLast = p === paragraphWordCounts.length - 1;
    if (remaining < len || isLast) {
      return { paragraphIndex: p, wordIndex: Math.floor(Math.min(remaining, len)) };
    }
    remaining -= len;
  }
  return { paragraphIndex: 0, wordIndex: 0 };
}
