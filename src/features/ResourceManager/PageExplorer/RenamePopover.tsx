'use client';

import { Input, Popover } from 'antd';
import { createStyles } from 'antd-style';
import dynamic from 'next/dynamic';
import React, { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';

const EmojiPicker = dynamic(() => import('@lobehub/ui/es/EmojiPicker'), { ssr: false });

const useStyles = createStyles(({ css }) => ({
  input: css`
    flex: 1;
  `,
  inputGroup: css`
    display: flex;
    gap: 8px;
    align-items: center;
  `,
  popoverContent: css`
    width: 320px;
  `,
}));

interface RenamePopoverProps {
  children: React.ReactElement;
  currentEmoji?: string;
  currentTitle: string;
  onConfirm: (title: string, emoji?: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const RenamePopover = memo<RenamePopoverProps>(
  ({ children, currentTitle, currentEmoji, onConfirm, open, onOpenChange }) => {
    const { t } = useTranslation(['file', 'editor']);
    const { styles } = useStyles();
    const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);

    const [title, setTitle] = useState(currentTitle);
    const [emoji, setEmoji] = useState<string | undefined>(currentEmoji);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = useRef<any>(null);
    const isInteractingWithEmojiPicker = useRef(false);

    // Reset state when popover opens
    const handleOpenChange = (nextOpen: boolean) => {
      if (nextOpen) {
        setTitle(currentTitle);
        setEmoji(currentEmoji);
        setShowEmojiPicker(false);
      }
      onOpenChange(nextOpen);
    };

    // Select all text when popover opens
    useEffect(() => {
      if (open && inputRef.current?.input) {
        // Use a slightly longer timeout to ensure the input is fully rendered
        const timer = setTimeout(() => {
          inputRef.current.input.select();
        }, 150);
        return () => clearTimeout(timer);
      }
    }, [open]);

    const handleTitleConfirm = () => {
      if (title.trim() && title.trim() !== currentTitle) {
        onConfirm(title.trim(), emoji);
      }
      onOpenChange(false);
    };

    const handleBlur = () => {
      // Use setTimeout to check if we're interacting with emoji picker
      setTimeout(() => {
        // Don't close if emoji picker interaction is in progress
        if (isInteractingWithEmojiPicker.current) {
          return;
        }

        // Save title on blur if it changed
        if (title.trim() && title.trim() !== currentTitle) {
          onConfirm(title.trim(), emoji);
        }
        onOpenChange(false);
      }, 150);
    };

    const content = (
      <div className={styles.popoverContent}>
        <div className={styles.inputGroup}>
          <EmojiPicker
            allowDelete
            locale={locale}
            onChange={(newEmoji) => {
              setEmoji(newEmoji);
              setShowEmojiPicker(false);
              isInteractingWithEmojiPicker.current = false;
              // Update emoji immediately
              onConfirm(title, newEmoji);
              // Refocus input after emoji selection
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            onDelete={() => {
              setEmoji(undefined);
              setShowEmojiPicker(false);
              isInteractingWithEmojiPicker.current = false;
              // Update to remove emoji immediately
              onConfirm(title, undefined);
              // Refocus input after emoji deletion
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            onOpenChange={(isOpen) => {
              setShowEmojiPicker(isOpen);
              isInteractingWithEmojiPicker.current = isOpen;
            }}
            open={showEmojiPicker}
            size={32}
            style={{
              fontSize: 32,
            }}
            title={t('documentEditor.chooseIcon')}
            value={emoji}
          />
          <Input
            autoFocus
            className={styles.input}
            onBlur={handleBlur}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTitleConfirm();
              } else if (e.key === 'Escape') {
                onOpenChange(false);
              }
            }}
            placeholder={t('documentEditor.titlePlaceholder')}
            ref={inputRef}
            value={title}
          />
        </div>
      </div>
    );

    return (
      <Popover
        content={content}
        onOpenChange={handleOpenChange}
        open={open}
        placement="bottom"
        trigger={[]}
      >
        {children}
      </Popover>
    );
  },
);

export default RenamePopover;
