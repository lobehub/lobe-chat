import { act, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { MemoryRouter, useNavigate } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { useCloseOnNavigate } from './useCloseOnNavigate';

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(MemoryRouter, { initialEntries: ['/'] }, children);

const setup = (open: boolean) => {
  const close = vi.fn();
  const hook = renderHook(
    ({ open }) => {
      useCloseOnNavigate(open, close);
      return useNavigate();
    },
    { initialProps: { open }, wrapper },
  );
  return { close, ...hook };
};

describe('useCloseOnNavigate', () => {
  it('does not close on mount', () => {
    const { close } = setup(true);

    expect(close).not.toHaveBeenCalled();
  });

  it('closes an open host when navigation commits', () => {
    const { close, result } = setup(true);

    act(() => {
      void result.current('/settings/plans');
    });

    expect(close).toHaveBeenCalledTimes(1);
  });

  it('closes on a same-path navigation', () => {
    const { close, result } = setup(true);

    act(() => {
      void result.current('/');
    });

    expect(close).toHaveBeenCalledTimes(1);
  });

  it('leaves a closed host alone and does not close it on reopen', () => {
    const { close, rerender, result } = setup(false);

    act(() => {
      void result.current('/settings/stats');
    });
    rerender({ open: true });

    expect(close).not.toHaveBeenCalled();
  });
});
