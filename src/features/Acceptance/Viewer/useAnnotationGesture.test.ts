/** @vitest-environment happy-dom */
import { act, renderHook } from '@testing-library/react';
import type { PointerEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useAnnotationGesture } from './useAnnotationGesture';

const pointer = (x: number, y: number) =>
  ({
    clientX: x,
    clientY: y,
    pointerId: 7,
    pointerType: 'touch',
    currentTarget: { setPointerCapture: vi.fn() },
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  }) as unknown as PointerEvent<HTMLDivElement>;

const setup = (drawing = true) => {
  const onDraw = vi.fn();
  const onUpdate = vi.fn();
  const hook = renderHook(() => useAnnotationGesture({ drawing, onDraw, onUpdate }));
  const image = document.createElement('img');
  vi.spyOn(image, 'getBoundingClientRect').mockReturnValue({
    x: 10,
    y: 20,
    left: 10,
    top: 20,
    width: 200,
    height: 400,
    right: 210,
    bottom: 420,
    toJSON: () => ({}),
  });
  hook.result.current.imageRef.current = image;
  return { ...hook, onDraw, onUpdate };
};

describe('touch annotation gestures', () => {
  it('captures touch and commits a normalized region on pointer up', () => {
    const { result, onDraw } = setup();
    const start = pointer(30, 60);
    act(() => result.current.handlers.onPointerDown(start));
    act(() => result.current.handlers.onPointerMove(pointer(110, 220)));
    expect(start.currentTarget.setPointerCapture).toHaveBeenCalledWith(7);
    expect(result.current.draft).toEqual({ x: 0.1, y: 0.1, width: 0.4, height: 0.4 });
    act(() => result.current.handlers.onPointerUp(pointer(110, 220)));
    expect(onDraw).toHaveBeenCalledWith({ x: 0.1, y: 0.1, width: 0.4, height: 0.4 });
    expect(result.current.draft).toBeNull();
  });
  it('does not turn a cancelled touch into a region', () => {
    const { result, onDraw } = setup();
    act(() => result.current.handlers.onPointerDown(pointer(30, 60)));
    act(() => result.current.handlers.onPointerCancel());
    act(() => result.current.handlers.onPointerUp(pointer(110, 220)));
    expect(onDraw).not.toHaveBeenCalled();
  });
  it('lets browsing gestures scroll without drawing or capturing them', () => {
    const { result, onDraw } = setup(false);
    const start = pointer(30, 60);
    act(() => result.current.handlers.onPointerDown(start));
    act(() => result.current.handlers.onPointerUp(pointer(110, 220)));
    expect(start.preventDefault).not.toHaveBeenCalled();
    expect(start.currentTarget.setPointerCapture).not.toHaveBeenCalled();
    expect(onDraw).not.toHaveBeenCalled();
  });
});
