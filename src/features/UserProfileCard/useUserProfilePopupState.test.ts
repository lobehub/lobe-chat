import { act, renderHook } from '@testing-library/react';
import type { MouseEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useUserProfilePopupState } from './useUserProfilePopupState';

const createClick = () => {
  const preventBaseUIHandler = vi.fn();
  const event = {
    preventBaseUIHandler,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as MouseEvent & { preventBaseUIHandler: () => void };
  return { event, preventBaseUIHandler };
};

type BothTriggerProps = {
  'data-pinned'?: string;
  'onClick': (event: MouseEvent) => void;
  'openOnHover': boolean;
};

const renderState = (trigger: 'both' | 'hover' = 'both') =>
  renderHook(() => useUserProfilePopupState(trigger));

const clickTrigger = (result: { current: ReturnType<typeof useUserProfilePopupState> }) => {
  const click = createClick();
  act(() => {
    (result.current.triggerProps as BothTriggerProps).onClick(click.event);
  });
  return click;
};

describe('useUserProfilePopupState', () => {
  it('pins a hover preview on click instead of letting the library toggle it closed', () => {
    const { result } = renderState();

    // Hover preview opened by the library.
    act(() => result.current.onOpenChange(true));
    expect(result.current.pinned).toBe(false);
    expect((result.current.triggerProps as BothTriggerProps).openOnHover).toBe(true);

    const { preventBaseUIHandler } = clickTrigger(result);

    expect(preventBaseUIHandler).toHaveBeenCalledTimes(1);
    expect(result.current.open).toBe(true);
    expect(result.current.pinned).toBe(true);
    expect((result.current.triggerProps as BothTriggerProps)['data-pinned']).toBe('');
    // Pinned: leaving the avatar no longer closes the card.
    expect((result.current.triggerProps as BothTriggerProps).openOnHover).toBe(false);
  });

  it('pins on a click while closed and lets the library open it', () => {
    const { result } = renderState();

    const { preventBaseUIHandler } = clickTrigger(result);
    act(() => result.current.onOpenChange(true));

    expect(preventBaseUIHandler).not.toHaveBeenCalled();
    expect(result.current.open).toBe(true);
    expect(result.current.pinned).toBe(true);
  });

  it('closes a pinned card on another click', () => {
    const { result } = renderState();
    act(() => result.current.onOpenChange(true));
    clickTrigger(result);

    const { preventBaseUIHandler } = clickTrigger(result);

    expect(preventBaseUIHandler).toHaveBeenCalledTimes(1);
    expect(result.current.open).toBe(false);
    expect(result.current.pinned).toBe(false);
  });

  it('unpins when the library closes it (Esc, outside click)', () => {
    const { result } = renderState();
    clickTrigger(result);
    act(() => result.current.onOpenChange(true));

    act(() => result.current.onOpenChange(false));

    expect(result.current.open).toBe(false);
    expect(result.current.pinned).toBe(false);
  });

  it('keeps only one card open', () => {
    const first = renderState();
    const second = renderState();

    clickTrigger(first.result);
    act(() => first.result.current.onOpenChange(true));
    act(() => second.result.current.onOpenChange(true));

    expect(second.result.current.open).toBe(true);
    expect(first.result.current.open).toBe(false);
    expect(first.result.current.pinned).toBe(false);
  });

  it('closes when the window loses focus', () => {
    const { result } = renderState();
    clickTrigger(result);
    act(() => result.current.onOpenChange(true));

    act(() => {
      window.dispatchEvent(new Event('blur'));
    });

    expect(result.current.open).toBe(false);
    expect(result.current.pinned).toBe(false);
  });

  it('closes through the popover close once the card registered it', () => {
    const first = renderState();
    const second = renderState();
    const closeFirstPopover = vi.fn(() => first.result.current.onOpenChange(false));
    const closeSecondPopover = vi.fn(() => second.result.current.onOpenChange(false));

    clickTrigger(first.result);
    act(() => first.result.current.onOpenChange(true));
    act(() => first.result.current.registerClose(closeFirstPopover));

    // Another card opening.
    act(() => second.result.current.onOpenChange(true));
    act(() => second.result.current.registerClose(closeSecondPopover));
    expect(closeFirstPopover).toHaveBeenCalledTimes(1);
    expect(first.result.current.open).toBe(false);
    expect(first.result.current.pinned).toBe(false);

    // The window losing focus.
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(closeSecondPopover).toHaveBeenCalledTimes(1);
    expect(second.result.current.open).toBe(false);

    // A second click on a pinned card.
    act(() => first.result.current.onOpenChange(true));
    clickTrigger(first.result);
    clickTrigger(first.result);
    expect(closeFirstPopover).toHaveBeenCalledTimes(2);
    expect(first.result.current.open).toBe(false);
  });

  it('closes a hover-only preview on click and lets the click through', () => {
    const { result } = renderState('hover');
    act(() => result.current.onOpenChange(true));

    act(() => {
      (result.current.triggerProps as { onClick: () => void }).onClick();
    });

    expect(result.current.open).toBe(false);
  });
});
