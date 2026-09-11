import { describe, expect, it, vi } from 'vitest';

import { getSelectedFlowNodeId, isRectInView, panNodeIntoView } from './flowViewport';

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

describe('panNodeIntoView', () => {
  const flow = (
    viewport = { x: 0, y: 0, zoom: 1 },
    bounds = { height: 100, width: 200, x: 100, y: 50 },
  ) => ({
    getNodesBounds: vi.fn().mockReturnValue(bounds),
    getViewport: vi.fn().mockReturnValue(viewport),
    setViewport: vi.fn(),
  });

  it('does nothing without a node, without a layout, or when it is already visible', () => {
    const idle = flow();
    panNodeIntoView(idle, size, undefined);
    panNodeIntoView(idle, size, 'node-1');
    const unlaid = flow({ x: 0, y: 0, zoom: 1 }, { height: 0, width: 0, x: 0, y: 0 });
    panNodeIntoView(unlaid, size, 'node-1');
    expect(idle.setViewport).not.toHaveBeenCalled();
    expect(unlaid.setViewport).not.toHaveBeenCalled();
  });

  it('pans only far enough to clear the edge the panel pushed the node past', () => {
    // 880..1080 against a 1000 canvas: 104px of overflow plus the 24px inset.
    const api = flow({ x: 0, y: 0, zoom: 1 }, { height: 100, width: 200, x: 880, y: 50 });
    panNodeIntoView(api, size, 'node-1');
    expect(api.setViewport).toHaveBeenCalledWith({ x: -104, y: 0, zoom: 1 });
  });

  it('leaves the axis that still fits completely alone', () => {
    const api = flow({ x: 0, y: 0, zoom: 1 }, { height: 100, width: 200, x: -300, y: 200 });
    panNodeIntoView(api, size, 'node-1');
    expect(api.setViewport).toHaveBeenCalledWith({ x: 324, y: 0, zoom: 1 });
  });

  it('never centres: a node barely past the edge moves by that much, not by half a canvas', () => {
    // Centring this node would move it ~400px; it only needs 34.
    const api = flow({ x: 0, y: 0, zoom: 1 }, { height: 100, width: 200, x: 810, y: 50 });
    panNodeIntoView(api, size, 'node-1');
    expect(api.setViewport).toHaveBeenCalledWith({ x: -34, y: 0, zoom: 1 });
  });

  it('treats a node inside the canvas but close to its edge as visible', () => {
    const api = flow({ x: 0, y: 0, zoom: 1 }, { height: 100, width: 200, x: 790, y: 50 });
    panNodeIntoView(api, size, 'node-1');
    expect(api.setViewport).not.toHaveBeenCalled();
  });

  it('aligns the leading edge of a node too tall to fit', () => {
    const api = flow({ x: 0, y: 0, zoom: 1 }, { height: 900, width: 200, x: 100, y: 400 });
    panNodeIntoView(api, size, 'node-1');
    expect(api.setViewport).toHaveBeenCalledWith({ x: 0, y: -376, zoom: 1 });
  });

  it('scales the shift with the zoom', () => {
    const api = flow({ x: 0, y: 0, zoom: 0.5 }, { height: 100, width: 200, x: 2000, y: 50 });
    panNodeIntoView(api, size, 'node-1');
    expect(api.setViewport).toHaveBeenCalledWith({ x: -124, y: 0, zoom: 0.5 });
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
