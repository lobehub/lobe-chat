'use client';

import { Input, stopPropagation } from '@lobehub/ui';
import { type KeyboardEvent, memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { pageActions } from '@/store/page';

interface RenameInputProps {
  id: string;
  /** Closes the editor; the store clears `renamingPageId` on commit itself. */
  onDone: () => void;
  title: string;
}

/**
 * Window in which a blur is read as the menu handing focus back rather than the
 * user leaving the field. `queueMicrotask` focus plus the menu's exit animation
 * already cost ~250ms, and a slow main thread stretches that further.
 */
const FOCUS_CHURN_MS = 800;

/**
 * Inline rename field for a page row, the same shape knowledge-base rows use.
 * It replaces the row title instead of opening a popover: the row is only a few
 * dozen pixels tall inside a scrollable sidebar, and a popover anchored to a
 * zero-size node landed nowhere the user could see.
 */
const RenameInput = memo<RenameInputProps>(({ id, title, onDone }) => {
  const { t } = useTranslation('file');

  const [value, setValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);
  /** When the field last (re)mounted, in `performance.now()` time. */
  const mountedAtRef = useRef(0);

  useEffect(() => {
    setValue(title);
    submittingRef.current = false;
    mountedAtRef.current = performance.now();

    queueMicrotask(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [title]);


  const handleUpdate = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    const next = value.trim();
    if (next && next !== title) {
      // `renamePage` clears `renamingPageId` in its own `finally`.
      await pageActions.renamePage(id, next);
    }

    onDone();
  }, [id, onDone, title, value]);

  /**
   * Dismissing the row menu hands focus back to its trigger a tick after this
   * field mounts. The restore is not one frame: the menu host unmounts and then
   * re-focuses the trigger, and on a busy main thread that lands well past the
   * next paint. Treat a blur inside that window as focus churn — commit only
   * once the field has actually been the user's target — otherwise choosing
   * "Rename" closes the field before it can be typed into.
   */
  const handleBlur = useCallback(() => {
    if (performance.now() - mountedAtRef.current < FOCUS_CHURN_MS) {
      inputRef.current?.focus();
      return;
    }

    void handleUpdate();
  }, [handleUpdate]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onDone();
      }
    },
    [onDone],
  );

  return (
    <Input
      autoFocus
      data-testid={'page-rename-input'}
      maxLength={64}
      placeholder={t('pageEditor.titlePlaceholder')}
      ref={inputRef}
      size={'small'}
      style={{ width: '100%' }}
      value={value}
      onBlur={handleBlur}
      onChange={(e) => setValue(e.target.value)}
      onClick={stopPropagation}
      onKeyDown={handleKeyDown}
      onMouseDown={stopPropagation}
      onPressEnter={() => void handleUpdate()}
    />
  );
});

RenameInput.displayName = 'PageRenameInput';

export default RenameInput;
