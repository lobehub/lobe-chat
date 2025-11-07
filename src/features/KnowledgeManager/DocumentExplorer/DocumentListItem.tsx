'use client';

import { Icon } from '@lobehub/ui';
import { Input } from 'antd';
import { createStyles } from 'antd-style';
import { FileText } from 'lucide-react';
import { memo, useRef } from 'react';

import { FileListItem } from '@/types/files';

import DocumentActions from './DocumentActions';

const useStyles = createStyles(({ css, token }) => ({
  documentActions: css`
    display: flex;
    align-items: center;

    padding: 0;
    border-radius: ${token.borderRadiusSM}px;

    opacity: 0;
    background: ${token.colorBgContainer};
    box-shadow: ${token.boxShadowSecondary};

    transition: opacity ${token.motionDurationMid};
  `,
  documentCard: css`
    cursor: pointer;
    user-select: none;

    position: relative;

    display: flex;
    gap: 12px;
    align-items: center;

    min-height: 36px;
    margin-block: 4px;
    margin-inline: 8px;
    padding-block: 8px;
    padding-inline: 12px;
    border-radius: ${token.borderRadius}px;

    color: ${token.colorTextSecondary};

    background: transparent;

    transition: all ${token.motionDurationMid};

    &:hover {
      background: ${token.colorFillTertiary};

      .document-actions {
        opacity: 1;
      }
    }

    &.selected {
      color: ${token.colorText};
      background: ${token.colorFillSecondary};
    }
  `,
  documentContent: css`
    display: flex;
    flex: 1;
    gap: 12px;
    align-items: center;

    min-width: 0;
  `,
  documentTitle: css`
    overflow: hidden;
    flex: 1;

    min-width: 0;

    font-size: 14px;
    line-height: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  emoji: css`
    font-size: 16px;
    line-height: 1;
  `,
  icon: css`
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${token.colorTextSecondary};
  `,
  renameInput: css`
    flex: 1;
    min-width: 0;
    height: 20px;
    padding: 0;

    input {
      height: 20px;
      padding: 0;
      border: none;

      font-size: 14px;
      line-height: 20px;

      background: transparent;
      box-shadow: none !important;

      &:focus {
        border: none;
        box-shadow: none !important;
      }
    }
  `,
}));

interface DocumentListItemProps {
  document: FileListItem;
  isRenaming: boolean;
  isSelected: boolean;
  onDelete: () => void;
  onRename: (documentId: string, currentName: string) => void;
  onRenameCancel: () => void;
  onRenameSubmit: () => void;
  onSelect: (documentId: string) => void;
  renameValue: string;
  setRenameValue: (value: string) => void;
  untitledText: string;
}

const DocumentListItem = memo<DocumentListItemProps>(
  ({
    document,
    isRenaming,
    isSelected,
    onDelete,
    onRename,
    onRenameCancel,
    onRenameSubmit,
    onSelect,
    renameValue,
    setRenameValue,
    untitledText,
  }) => {
    const { styles, cx } = useStyles();
    const renameInputRef = useRef<any>(null);

    const title = document.name || untitledText;
    const emoji = document.metadata?.emoji;

    return (
      <div
        className={cx(styles.documentCard, isSelected && 'selected')}
        onClick={() => !isRenaming && onSelect(document.id)}
      >
        <div className={styles.documentContent}>
          {emoji ? (
            <span className={styles.emoji}>{emoji}</span>
          ) : (
            <Icon className={styles.icon} icon={FileText} size={16} />
          )}
          {isRenaming ? (
            <Input
              autoFocus
              className={styles.renameInput}
              onBlur={onRenameSubmit}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onRenameSubmit();
                } else if (e.key === 'Escape') {
                  onRenameCancel();
                }
              }}
              onPressEnter={onRenameSubmit}
              ref={renameInputRef}
              value={renameValue}
            />
          ) : (
            <div className={styles.documentTitle}>{title}</div>
          )}
        </div>
        <div className={cx(styles.documentActions, 'document-actions')}>
          <DocumentActions
            documentContent={document.content || undefined}
            documentId={document.id}
            onDelete={onDelete}
            onRename={() => onRename(document.id, title)}
          />
        </div>
      </div>
    );
  },
);

export default DocumentListItem;
