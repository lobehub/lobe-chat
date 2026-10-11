import { type IEditor } from '@lobehub/editor';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseComposerFocusParams {
  /** Expand and focus — set when the drawer opens with conversational intent. */
  autoFocus: boolean;
  /** Start expanded without taking focus — a host that pins the composer open. */
  defaultExpanded: boolean;
  editor?: Pick<IEditor, 'focus'> | null;
}

/**
 * Decides when the reply composer expands and when it takes focus. Only an
 * explicit request to write (the expand click or `autoFocus`) takes focus; a
 * host that merely pins the composer open must not steal it.
 */
export const useComposerFocus = ({
  autoFocus,
  defaultExpanded,
  editor,
}: UseComposerFocusParams) => {
  const [expanded, setExpanded] = useState(defaultExpanded || autoFocus);
  const focusOnInitRef = useRef(autoFocus);

  // Focus from the editor's own init callback: a mount-time `editor.focus()`
  // runs before the lexical root attaches and is silently dropped, while
  // `onInit` fires once the kernel is ready.
  const handleEditorInit = useCallback((instance: Pick<IEditor, 'focus'>) => {
    if (focusOnInitRef.current) instance.focus?.();
  }, []);

  // "Continue chat" on a drawer that is already open for this topic keeps the
  // body mounted, so the request has to reach the live composer too.
  useEffect(() => {
    if (!autoFocus) return;
    focusOnInitRef.current = true;
    setExpanded(true);
    editor?.focus?.();
  }, [autoFocus, editor]);

  const expand = useCallback(() => {
    focusOnInitRef.current = true;
    setExpanded(true);
  }, []);

  const collapse = useCallback(() => setExpanded(false), []);

  return { collapse, expand, expanded, handleEditorInit };
};
