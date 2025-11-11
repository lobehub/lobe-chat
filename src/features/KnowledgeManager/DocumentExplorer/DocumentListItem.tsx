'use client';

import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { FileText } from 'lucide-react';
import { memo } from 'react';

import { LobeDocument } from '@/types/document';

import DocumentActions from './DocumentActions';
import RenamePopover from './RenamePopover';

const useStyles = createStyles(({ css, token }) => ({
  documentActions: css`
    opacity: 0;
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
}));

interface DocumentListItemProps {
  document: LobeDocument;
  isRenaming: boolean;
  isSelected: boolean;
  onDelete: () => void;
  onRenameConfirm: (documentId: string, title: string, emoji?: string) => void;
  onRenameOpenChange: (documentId: string, open: boolean) => void;
  onSelect: (documentId: string) => void;
  untitledText: string;
}

const DocumentListItem = memo<DocumentListItemProps>(
  ({
    document,
    isRenaming,
    isSelected,
    onDelete,
    onRenameConfirm,
    onRenameOpenChange,
    onSelect,
    untitledText,
  }) => {
    const { styles, cx } = useStyles();

    const title = document.title || untitledText;
    const emoji = document.metadata?.emoji;

    return (
      <div
        className={cx(styles.documentCard, isSelected && 'selected')}
        onClick={() => !isRenaming && onSelect(document.id)}
      >
        <RenamePopover
          currentEmoji={emoji}
          currentTitle={title}
          onConfirm={(newTitle, newEmoji) => {
            onRenameConfirm(document.id, newTitle, newEmoji);
          }}
          onOpenChange={(open) => onRenameOpenChange(document.id, open)}
          open={isRenaming}
        >
          <div className={styles.documentContent}>
            {emoji ? (
              <span className={styles.emoji}>{emoji}</span>
            ) : (
              <Icon className={styles.icon} icon={FileText} size={16} />
            )}
            <div className={styles.documentTitle}>{title}</div>
          </div>
        </RenamePopover>
        <div className={cx(styles.documentActions, 'document-actions')}>
          <DocumentActions
            documentContent={document.content || undefined}
            documentId={document.id}
            onDelete={onDelete}
            onRename={() => onRenameOpenChange(document.id, true)}
          />
        </div>
      </div>
    );
  },
);

export default DocumentListItem;
