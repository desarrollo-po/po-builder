import { useCallback, useRef } from "react";

interface Options {
  ratio: number;
  onChange: (ratio: number) => void;
  min?: number;
  max?: number;
}

// Vertical resize handle: pointer-driven, computes the new ratio from the
// pointer's Y position relative to the container that holds both panes.
// Caller is responsible for passing the same container ref to both the
// panes and the handle's parent so heights align.
export function useVerticalSplit({ ratio, onChange, min = 0.15, max = 0.85 }: Options) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (rect.height <= 0) return;
      const next = (e.clientY - rect.top) / rect.height;
      const clamped = Math.min(max, Math.max(min, next));
      onChange(clamped);
    },
    [onChange, min, max],
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  }, []);

  return {
    containerRef,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
    ratio,
  };
}
