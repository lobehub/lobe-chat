import type { Rect, Viewport } from '@xyflow/react';

/** Breathing room between a revealed node and the canvas edge. */
const INSET = 24;

export interface CanvasSize {
  height: number;
  width: number;
}

/** Whether a flow-space rect sits fully inside the visible canvas. */
export const isRectInView = (rect: Rect, viewport: Viewport, size: CanvasSize) => {
  const left = rect.x * viewport.zoom + viewport.x;
  const top = rect.y * viewport.zoom + viewport.y;
  return (
    left >= 0 &&
    top >= 0 &&
    left + rect.width * viewport.zoom <= size.width &&
    top + rect.height * viewport.zoom <= size.height
  );
};

/**
 * `buildFlowGraph` marks the picked node inside `data`, not with React Flow's
 * own `selected` flag, so the reveal logic must read it from there.
 */
export const getSelectedFlowNodeId = (nodes: { data: Record<string, unknown>; id: string }[]) =>
  nodes.find((node) => Boolean(node.data.selected))?.id;

export interface FlowViewportApi {
  getNodesBounds: (nodes: string[]) => Rect;
  getViewport: () => Viewport;
  setViewport: (viewport: Viewport) => unknown;
}

/**
 * The least shift that brings a span inside the visible extent. A span longer
 * than the extent cannot fit, so its leading edge wins: reading starts there.
 */
const axisShift = (start: number, length: number, extent: number) => {
  if (length >= extent - INSET * 2 || start < INSET) return INSET - start;
  const overflow = start + length - (extent - INSET);
  return overflow > 0 ? -overflow : 0;
};

/**
 * Bring a node into view by panning the least possible distance, never by
 * zooming and never by centring. Centring throws the whole graph across the
 * canvas, so whatever the user just clicked ends up somewhere else entirely and
 * reads as having vanished.
 */
export const panNodeIntoView = (
  flow: FlowViewportApi,
  size: CanvasSize,
  id: string | undefined,
) => {
  if (!id) return;
  const bounds = flow.getNodesBounds([id]);
  if (!bounds.width || !bounds.height) return;
  const viewport = flow.getViewport();
  if (isRectInView(bounds, viewport, size)) return;
  const x =
    viewport.x +
    axisShift(bounds.x * viewport.zoom + viewport.x, bounds.width * viewport.zoom, size.width);
  const y =
    viewport.y +
    axisShift(bounds.y * viewport.zoom + viewport.y, bounds.height * viewport.zoom, size.height);
  if (x === viewport.x && y === viewport.y) return;
  flow.setViewport({ ...viewport, x, y });
};
