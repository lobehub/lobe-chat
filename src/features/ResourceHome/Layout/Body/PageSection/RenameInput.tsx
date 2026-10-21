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

  useEffect(() => {
    setValue(title);
    submittingRef.current = false;

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
      onBlur={() => void handleUpdate()}
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
