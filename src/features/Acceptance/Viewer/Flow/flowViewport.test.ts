import { describe, expect, it, vi } from 'vitest';

import {
  getSelectedFlowNodeId,
  isRectInView,
  revealSelectionAfterResize,
  revealToggledGroup,
} from './flowViewport';

const size = { height: 600, width: 1000 };

describe('isRectInView', () => {
  it('accepts a rect inside the canvas at the current zoom', () => {
    expect(
      isRectInView({ height: 100, width: 200, x: 100, y: 50 }, { x: 0, y: 0, zoom: 1 }, size),
    ).toBe(true);
  });

  it('rejects a rect crossing the right edge after zooming in', () => {
    expect(
      isRectInView({ height: 100, width: 200, x: 500, y: 50 }, { x: -100, y: 0, zoom: 2 }, size),
    ).toBe(false);
  });
});

describe('revealSelectionAfterResize', () => {
  const flow = (
    viewport = { x: 0, y: 0, zoom: 1.4 },
    bounds = { height: 80, width: 200, x: 100, y: 100 },
  ) => ({
    fitView: vi.fn().mockResolvedValue(true),
    getNodesBounds: vi.fn().mockReturnValue(bounds),
    getViewport: vi.fn().mockReturnValue(viewport),
  });

  it('keeps the zoomed viewport untouched when nothing is selected', () => {
    const api = flow();
    revealSelectionAfterResize(api, size, undefined);
    expect(api.fitView).not.toHaveBeenCalled();
  });

  it('keeps the zoomed viewport untouched when the selected node is still visible', () => {
    const api = flow();
    revealSelectionAfterResize(api, size, 'node-1');
    expect(api.fitView).not.toHaveBeenCalled();
  });

  it('pans at the same zoom when the panel pushes the selected node out of view', () => {
    const api = flow({ x: 0, y: 0, zoom: 1.4 }, { height: 80, width: 200, x: 620, y: 100 });
    revealSelectionAfterResize(api, size, 'node-1');
    expect(api.fitView).toHaveBeenCalledWith(
      expect.objectContaining({ maxZoom: 1.4, minZoom: 1.4, nodes: [{ id: 'node-1' }] }),
    );
  });

  it('ignores a selection whose node is not laid out yet', () => {
    const api = flow(undefined, { height: 0, width: 0, x: 0, y: 0 });
    revealSelectionAfterResize(api, size, 'node-1');
    expect(api.fitView).not.toHaveBeenCalled();
  });
});

describe('getSelectedFlowNodeId', () => {
  it('reads the picked node from graph data rather than the React Flow selected flag', () => {
    expect(
      getSelectedFlowNodeId([
        { data: { selected: false }, id: 'a' },
        { data: { selected: true }, id: 'b' },
        { data: {}, id: 'c' },
      ]),
    ).toBe('b');
    expect(getSelectedFlowNodeId([{ data: {}, id: 'a' }])).toBeUndefined();
  });
});

describe('revealToggledGroup', () => {
  const api = (
    viewport = { x: 0, y: 0, zoom: 1 },
    bounds = { height: 96, width: 360, x: 40, y: 40 },
  ) => ({
    fitView: vi.fn().mockResolvedValue(true),
    getNodesBounds: vi.fn().mockReturnValue(bounds),
    getViewport: vi.fn().mockReturnValue(viewport),
    setViewport: vi.fn(),
  });

  it('leaves the canvas alone when the toggled group is already fully visible', () => {
    const flow = api();
    revealToggledGroup(flow, size, 'group-1');
    expect(flow.fitView).not.toHaveBeenCalled();
    expect(flow.setViewport).not.toHaveBeenCalled();
  });

  it('pans a collapsed group back into view without changing the zoom', () => {
    const flow = api({ x: 0, y: 0, zoom: 0.8 }, { height: 96, width: 360, x: 40, y: 900 });
    revealToggledGroup(flow, size, 'group-1');
    expect(flow.fitView).toHaveBeenCalledWith(
      expect.objectContaining({ maxZoom: 0.8, minZoom: 0.8, nodes: [{ id: 'group-1' }] }),
    );
    expect(flow.setViewport).not.toHaveBeenCalled();
  });

  it('reads a group taller than the canvas from its header rather than its middle', () => {
    const flow = api({ x: 0, y: 0, zoom: 1 }, { height: 1200, width: 360, x: 40, y: 500 });
    revealToggledGroup(flow, size, 'group-1');
    expect(flow.setViewport).toHaveBeenCalledWith({ x: 0, y: 24 - 500, zoom: 1 });
    expect(flow.fitView).not.toHaveBeenCalled();
  });

  it('ignores a toggle with no group or no layout', () => {
    const flow = api({ x: 0, y: 0, zoom: 1 }, { height: 0, width: 0, x: 0, y: 0 });
    revealToggledGroup(flow, size, undefined);
    revealToggledGroup(flow, size, 'group-1');
    expect(flow.fitView).not.toHaveBeenCalled();
    expect(flow.setViewport).not.toHaveBeenCalled();
  });
});
