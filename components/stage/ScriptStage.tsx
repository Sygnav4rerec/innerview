"use client";

import { useEffect, useRef } from "react";

interface ScriptStageProps {
  paragraphWords: string[][];
  currentParagraphIndex: number;
  wordInParagraphIndex: number;
  /**
   * "overlay" = a height-capped band pinned to the bottom third of the
   * stage over a full-frame camera feed (the mirror experience — you and
   * the PiP reference stay fully visible; text never grows past its box).
   * "stage"   = full-bleed centered script, used when the camera is off and
   * there's nothing behind the text to protect legibility for.
   */
  variant?: "stage" | "overlay";
}

function HighlightedParagraph({
  words,
  wordInParagraphIndex,
  className,
}: {
  words: string[];
  wordInParagraphIndex: number;
  className: string;
}) {
  return (
    <p className={className}>
      {words.map((word, wIndex) => (
        <span
          key={wIndex}
          className={
            wIndex < wordInParagraphIndex
              ? "text-white/50"
              : wIndex === wordInParagraphIndex
                ? "rounded bg-white/20 px-1 text-white"
                : "text-white/90"
          }
        >
          {word}{" "}
        </span>
      ))}
    </p>
  );
}

const EMPTY_STATE = (
  <div className="flex h-full items-center justify-center px-8 text-center text-lg text-neutral-500">
    Paste your script in the sidebar to begin. Separate paragraphs with a blank line — each becomes one
    rehearsal beat.
  </div>
);

export function ScriptStage({
  paragraphWords,
  currentParagraphIndex,
  wordInParagraphIndex,
  variant = "stage",
}: ScriptStageProps) {
  const activeRef = useRef<HTMLDivElement | null>(null);

  // scrollIntoView finds its nearest scrollable ancestor automatically, so
  // this works whether that ancestor is the full-screen stage pane or the
  // height-capped overlay box.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentParagraphIndex]);

  if (paragraphWords.length === 0) {
    return variant === "overlay" ? null : EMPTY_STATE;
  }

  if (variant === "overlay") {
    // Only the current paragraph renders here (no past/future stacking) —
    // that's what keeps the box hugging just 2-3 lines instead of growing
    // to fit the whole script. max-h is a pure safety cap for an unusually
    // long paragraph; it only ever triggers internal scroll, never expands
    // the box itself.
    const currentWords = paragraphWords[currentParagraphIndex] ?? [];

    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-6 md:px-10 md:pb-10">
        <div
          className="pointer-events-auto max-h-[19vh] w-[92%] max-w-[900px] overflow-y-auto rounded-2xl px-6 py-3 md:max-h-[21vh] md:px-10 md:py-4"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.70) 55%, rgba(0,0,0,0.35) 100%)",
          }}
        >
          <div ref={activeRef}>
            <HighlightedParagraph
              words={currentWords}
              wordInParagraphIndex={wordInParagraphIndex}
              className="text-center text-xl font-semibold leading-snug drop-shadow-lg md:text-2xl"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-y-auto px-8 py-24 md:px-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        {paragraphWords.map((words, pIndex) => {
          const isCurrent = pIndex === currentParagraphIndex;
          const isPast = pIndex < currentParagraphIndex;

          return (
            <div
              key={pIndex}
              ref={isCurrent ? activeRef : null}
              className={[
                "transition-opacity duration-300",
                isCurrent ? "opacity-100" : isPast ? "opacity-20" : "opacity-40",
              ].join(" ")}
            >
              {isCurrent ? (
                <HighlightedParagraph
                  words={words}
                  wordInParagraphIndex={wordInParagraphIndex}
                  className="text-2xl leading-relaxed md:text-3xl"
                />
              ) : (
                <p className="text-2xl leading-relaxed text-neutral-200 md:text-3xl">{words.join(" ")}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
