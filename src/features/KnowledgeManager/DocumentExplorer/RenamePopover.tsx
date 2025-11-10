'use client';

import { Button, Input, Popover } from 'antd';
import { createStyles } from 'antd-style';
import dynamic from 'next/dynamic';
import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';

const EmojiPicker = dynamic(() => import('@lobehub/ui/es/EmojiPicker'), { ssr: false });

const useStyles = createStyles(({ css }) => ({
  footer: css`
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  `,
  input: css`
    flex: 1;
  `,
  inputGroup: css`
    display: flex;
    gap: 8px;
    align-items: center;
    margin-block-end: 12px;
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

    // Reset state when popover opens
    const handleOpenChange = (nextOpen: boolean) => {
      if (nextOpen) {
        setTitle(currentTitle);
        setEmoji(currentEmoji);
        setShowEmojiPicker(false);
      }
      onOpenChange(nextOpen);
    };

    const handleConfirm = () => {
      if (title.trim()) {
        onConfirm(title.trim(), emoji);
        onOpenChange(false);
      }
    };

    const handleCancel = () => {
      onOpenChange(false);
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
            }}
            onDelete={() => {
              setEmoji(undefined);
              setShowEmojiPicker(false);
            }}
            onOpenChange={(isOpen) => {
              setShowEmojiPicker(isOpen);
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
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirm();
              } else if (e.key === 'Escape') {
                handleCancel();
              }
            }}
            placeholder={t('documentEditor.titlePlaceholder')}
            value={title}
          />
        </div>
        <div className={styles.footer}>
          <Button onClick={handleCancel} size="small">
            {t('cancel', { ns: 'editor' })}
          </Button>
          <Button onClick={handleConfirm} size="small" type="primary">
            {t('confirm', { ns: 'editor' })}
          </Button>
        </div>
      </div>
    );

    return (
      <Popover
        content={content}
        onOpenChange={handleOpenChange}
        open={open}
        placement="bottom"
        trigger="click"
      >
        {children}
      </Popover>
    );
  },
);

export default RenamePopover;
