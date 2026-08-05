"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Mousemove specifically is filtered by movement distance — a hand resting
// near a mouse/trackpad while reading generates a steady stream of 1-2px
// jitter events that would otherwise reset the timer forever, making the
// controls look "stuck visible." Deliberate movement still clears it easily.
const JITTER_THRESHOLD_PX = 6;

/**
 * Returns whether floating controls should be visible. Visible on mount and
 * on any deliberate mouse/keyboard/touch activity, then fades after
 * `timeoutMs` of inactivity so the stage stays distraction-free.
 */
export function useInactivityFade(timeoutMs = 3000): boolean {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  const armTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), timeoutMs);
  }, [timeoutMs]);

  const reveal = useCallback(() => {
    setVisible(true);
    armTimer();
  }, [armTimer]);

  useEffect(() => {
    // Start the fade timer for the initial mount (visible already defaults
    // to true, so no setVisible call is needed here — only scheduling).
    armTimer();

    const handleMouseMove = (e: MouseEvent) => {
      const last = lastPointerRef.current;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      if (last) {
        const dx = e.clientX - last.x;
        const dy = e.clientY - last.y;
        if (dx * dx + dy * dy < JITTER_THRESHOLD_PX * JITTER_THRESHOLD_PX) return;
      }
      reveal();
    };

    // Keyboard, touch, and click are always deliberate — no filtering needed.
    const discreteEvents: (keyof WindowEventMap)[] = ["keydown", "touchstart", "click"];

    window.addEventListener("mousemove", handleMouseMove);
    discreteEvents.forEach((evt) => window.addEventListener(evt, reveal));

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      discreteEvents.forEach((evt) => window.removeEventListener(evt, reveal));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [armTimer, reveal]);

  return visible;
}
