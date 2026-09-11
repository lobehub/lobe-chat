import type { FitViewOptions, Rect, Viewport } from '@xyflow/react';

/** Breathing room above a group that is pinned to the top of the canvas. */
const TOP_INSET = 24;

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
  fitView: (options?: FitViewOptions) => Promise<boolean>;
  getNodesBounds: (nodes: string[]) => Rect;
  getViewport: () => Viewport;
}

/**
 * Expanding a group pushes everything below it down and can leave the group
 * itself running off the bottom; collapsing one pulls the stack back up. Move
 * only when the toggled group is not fully visible, and never change the zoom.
 */
export const revealToggledGroup = (
  flow: FlowViewportApi & { setViewport: (viewport: Viewport) => unknown },
  size: CanvasSize,
  id: string | undefined,
) => {
  if (!id) return;
  const bounds = flow.getNodesBounds([id]);
  if (!bounds.height) return;
  const viewport = flow.getViewport();
  if (isRectInView(bounds, viewport, size)) return;
  // A group taller than the canvas can never be centred usefully — read it from
  // its header down instead of landing in its middle.
  if (bounds.height * viewport.zoom > size.height - TOP_INSET * 2) {
    flow.setViewport({ ...viewport, y: TOP_INSET - bounds.y * viewport.zoom });
    return;
  }
  void flow.fitView({
    duration: 200,
    maxZoom: viewport.zoom,
    minZoom: viewport.zoom,
    nodes: [{ id }],
  });
};

/**
 * A side panel opening or closing changes the canvas width around the graph.
 * Keep the user's zoom and position untouched; only pan, at the same zoom,
 * when the selected node would otherwise be pushed out of view.
 */
export const revealSelectionAfterResize = (
  flow: FlowViewportApi,
  size: CanvasSize,
  selectedId: string | undefined,
) => {
  if (!selectedId) return;
  const viewport = flow.getViewport();
  const bounds = flow.getNodesBounds([selectedId]);
  if (!bounds.width || !bounds.height) return;
  if (isRectInView(bounds, viewport, size)) return;
  void flow.fitView({
    duration: 200,
    maxZoom: viewport.zoom,
    minZoom: viewport.zoom,
    nodes: [{ id: selectedId }],
  });
};
