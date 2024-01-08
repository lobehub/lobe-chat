import { act, renderHook } from '@testing-library/react';
import { RefObject } from 'react';

import { useAutoFocus } from '../useAutoFocus';

enum ElType {
  div,
  input,
  markdown,
  debug,
}

// 模拟elementFromPoint方法
document.elementFromPoint = function (x) {
  if (x === ElType.div) {
    return document.createElement('div');
  }

  if (x === ElType.input) {
    return document.createElement('input');
  }

  if (x === ElType.debug) {
    return document.createElement('pre');
  }

  if (x === ElType.markdown) {
    const markdownEl = document.createElement('article');
    const markdownChildEl = document.createElement('p');
    markdownEl.appendChild(markdownChildEl);
    return markdownChildEl;
  }

  return null;
};

describe('useAutoFocus', () => {
  it('should focus inputRef when mouseup event happens outside of input or markdown element', () => {
    const inputRef = { current: { focus: vi.fn() } } as RefObject<any>;
    renderHook(() => useAutoFocus(inputRef));

    // Simulate a mousedown event on an element outside of input or markdown element
    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: ElType.div }));
    });

    // Simulate a mouseup event
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    expect(inputRef.current?.focus).toHaveBeenCalledTimes(1);
  });

  it('should not focus inputRef when mouseup event happens inside of input element', () => {
    const inputRef = { current: { focus: vi.fn() } } as RefObject<any>;
    renderHook(() => useAutoFocus(inputRef));

    // Simulate a mousedown event on an input element
    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: ElType.input }));
    });

    // Simulate a mouseup event
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    expect(inputRef.current?.focus).not.toHaveBeenCalled();
  });

  it('should not focus inputRef when mouseup event happens inside of markdown element', () => {
    const inputRef = { current: { focus: vi.fn() } } as RefObject<any>;
    renderHook(() => useAutoFocus(inputRef));

    // Simulate a mousedown event on a markdown element
    act(() => {
      document.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true, clientX: ElType.markdown }),
      );
    });

    // Simulate a mouseup event
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    expect(inputRef.current?.focus).not.toHaveBeenCalled();
  });

  it('should not focus inputRef when mouseup event happens inside of debug element', () => {
    const inputRef = { current: { focus: vi.fn() } } as RefObject<any>;
    renderHook(() => useAutoFocus(inputRef));

    // Simulate a mousedown event on a debug element
    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: ElType.debug }));
    });

    // Simulate a mouseup event
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    expect(inputRef.current?.focus).not.toHaveBeenCalled();
  });
});
