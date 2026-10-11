import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useComposerFocus } from './useComposerFocus';

const createEditor = () => ({ focus: vi.fn() });

describe('useComposerFocus', () => {
  it('should start expanded without taking focus when the host only pins it open', () => {
    const editor = createEditor();
    const { result } = renderHook(() =>
      useComposerFocus({ autoFocus: false, defaultExpanded: true, editor }),
    );

    act(() => result.current.handleEditorInit(editor));

    expect(result.current.expanded).toBe(true);
    expect(editor.focus).not.toHaveBeenCalled();
  });

  it('should start expanded and focus once the editor is ready when opened with autoFocus', () => {
    const editor = createEditor();
    const { result } = renderHook(() =>
      useComposerFocus({ autoFocus: true, defaultExpanded: false, editor }),
    );
    editor.focus.mockClear();

    act(() => result.current.handleEditorInit(editor));

    expect(result.current.expanded).toBe(true);
    expect(editor.focus).toHaveBeenCalledTimes(1);
  });

  it('should focus after the user expands the collapsed composer', () => {
    const editor = createEditor();
    const { result } = renderHook(() =>
      useComposerFocus({ autoFocus: false, defaultExpanded: false, editor }),
    );
    expect(result.current.expanded).toBe(false);

    act(() => result.current.expand());
    act(() => result.current.handleEditorInit(editor));

    expect(result.current.expanded).toBe(true);
    expect(editor.focus).toHaveBeenCalledTimes(1);
  });

  it('should expand and focus a mounted composer when autoFocus turns on', () => {
    const editor = createEditor();
    const { rerender, result } = renderHook(
      ({ autoFocus }) => useComposerFocus({ autoFocus, defaultExpanded: false, editor }),
      { initialProps: { autoFocus: false } },
    );
    expect(result.current.expanded).toBe(false);

    rerender({ autoFocus: true });

    expect(result.current.expanded).toBe(true);
    expect(editor.focus).toHaveBeenCalled();
  });
});
