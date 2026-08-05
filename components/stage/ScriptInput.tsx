"use client";

import { useAppStore } from "@/store/useAppStore";

/**
 * Plain textarea for script editing. Spacebar types a space here as normal —
 * the global play/pause shortcut (useKeyboardShortcuts) explicitly ignores
 * keydown events whose target is a textarea, so the two never conflict.
 */
export function ScriptInput() {
  const script = useAppStore((s) => s.script);
  const setScript = useAppStore((s) => s.setScript);

  return (
    <textarea
      value={script}
      onChange={(e) => setScript(e.target.value)}
      placeholder={"Paste or write your script here.\n\nSeparate paragraphs with a blank line —\n\neach paragraph becomes one rehearsal beat."}
      className="h-full w-full resize-none bg-transparent text-sm leading-relaxed text-neutral-200 placeholder-neutral-600 outline-none"
      spellCheck={false}
    />
  );
}
