"use client";

import { useCallback, useState } from "react";

export interface Position {
  x: number;
  y: number;
}

export interface DragHandleProps {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}

/**
 * Minimal pointer-based drag for the floating PiP window. The window is
 * toggled on/off (not always present) and, once open, can be dragged freely
 * around the stage.
 */
export function useDraggable(initial: Position) {
  const [position, setPosition] = useState<Position>(initial);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      setDragging(true);
      setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [position]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      setPosition({
        x: Math.max(0, e.clientX - offset.x),
        y: Math.max(0, e.clientY - offset.y),
      });
    },
    [dragging, offset]
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    setDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const dragHandleProps: DragHandleProps = { onPointerDown, onPointerMove, onPointerUp };

  return { position, dragHandleProps };
}
