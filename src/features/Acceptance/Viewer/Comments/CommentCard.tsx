'use client';

import type { AcceptanceCommentItem } from '@lobechat/types';
import { Flexbox, Icon } from '@lobehub/ui';
import type { DropdownItem } from '@lobehub/ui/base-ui';
import {
  ActionIcon,
  Avatar,
  confirmModal,
  DropdownMenu,
  Tag,
  Text,
  toast,
} from '@lobehub/ui/base-ui';
import { Link2, MoreHorizontal, Trash2 } from 'lucide-react';
import { memo, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useActivityTime } from '@/hooks/useActivityTime';

import { AttachmentThumbs } from '../Evidence/attachments';
import { commentAnchorUrl } from './anchor';
import CommentReactions from './CommentReactions';
import { styles } from './styles';

export const commentAuthorName = (author: AcceptanceCommentItem['author']) =>
  author.fullName || author.username || '—';

/**
 * The author's face, plain. No ring: colour identifies the marks someone drew
 * on the evidence, and wrapping it around their avatar here said nothing while
 * making a quiet list look decorated.
 *
 * With no picture the fallback draws the name as text, and a two-character CJK
 * name wraps inside a small circle — so only the first character is handed over.
 */
export const CommentAvatar = memo<{ comment: AcceptanceCommentItem; size?: number }>(
  ({ comment, size = 20 }) => {
    const name = commentAuthorName(comment.author);
    return <Avatar avatar={comment.author.avatar || name.slice(0, 1)} size={size} />;
  },
);

CommentAvatar.displayName = 'AcceptanceCommentAvatar';

interface CommentCardProps {
  /** Present where the row is addressable — enables "copy link" in the menu. */
  anchored?: boolean;
  /** Rendered after the author line — anchor chip, round tag, resolved tag. */
  badges?: ReactNode;
  comment: AcceptanceCommentItem;
  /**
   * Replaces the author line for a row that is not a remark. A round's note
   * says "<agent> completed round N" — the landing and who did it in one line,
   * instead of an event row above a message that repeats the author.
   */
  nameOverride?: string;
  onDelete?: (id: string) => Promise<void>;
  /** Absent where reactions do not belong: a region note is a working thread. */
  onReact?: (id: string, emoji: string, on: boolean) => Promise<void>;
  /** True where the reader may write; the chips render for everyone else too. */
  reactable?: boolean;
  /**
   * `boxed` is the discussion message: a header strip over the body.
   * `plain` is the floating note: the same content with no frame of its own.
   */
  variant?: 'boxed' | 'plain';
}

/** One remark: who, when, what — and the author's own actions behind a menu. */
const CommentCard = memo<CommentCardProps>(
  ({
    anchored,
    badges,
    comment,
    nameOverride,
    onDelete,
    onReact,
    reactable,
    variant = 'boxed',
  }) => {
    const { t } = useTranslation('verify');
    const time = useActivityTime(comment.createdAt);
    const [deleting, setDeleting] = useState(false);
    const name = nameOverride ?? commentAuthorName(comment.author);

    const menuItems: DropdownItem[] = [
      ...(anchored
        ? [
            {
              icon: <Icon icon={Link2} />,
              key: 'copy-link',
              label: t('acceptance.comments.copyLink'),
              onClick: async () => {
                try {
                  await navigator.clipboard.writeText(commentAnchorUrl(comment.id));
                  toast.success(t('acceptance.comments.linkCopied'));
                } catch (cause) {
                  console.error('[acceptance:comments]', cause);
                  toast.error(t('acceptance.comments.updateFailed'));
                }
              },
            } satisfies DropdownItem,
          ]
        : []),
      ...(comment.canDelete && onDelete
        ? [
            {
              danger: true,
              icon: <Icon icon={Trash2} />,
              key: 'delete',
              label: t('acceptance.comments.delete'),
              onClick: () =>
                confirmModal({
                  content: t('acceptance.comments.deleteConfirm'),
                  okButtonProps: { danger: true },
                  okText: t('acceptance.comments.delete'),
                  onOk: async () => {
                    setDeleting(true);
                    try {
                      await onDelete(comment.id);
                    } catch (cause) {
                      console.error('[acceptance:comments]', cause);
                      toast.error(t('acceptance.comments.deleteFailed'));
                    } finally {
                      setDeleting(false);
                    }
                  },
                }),
            } satisfies DropdownItem,
          ]
        : []),
    ];

    return (
      <>
        <Flexbox
          horizontal
          align={'center'}
          className={variant === 'boxed' ? styles.boxHeader : undefined}
          gap={8}
          wrap={'wrap'}
        >
          {variant === 'plain' && <CommentAvatar comment={comment} size={18} />}
          <Text
            className={nameOverride ? styles.headline : styles.authorName}
            fontSize={13}
            weight={600}
          >
            {name}
          </Text>
          {comment.author.type === 'agent' && (
            <Tag size={'small'}>{t('acceptance.comments.author.agent')}</Tag>
          )}
          {comment.author.status !== 'active' && (
            <Tag size={'small'}>{t(`acceptance.comments.author.${comment.author.status}`)}</Tag>
          )}
          <span className={styles.meta} title={time.title}>
            {nameOverride ? time.text : t('acceptance.comments.commented', { time: time.text })}
          </span>
          {badges}
          {menuItems.length > 0 && (
            <div data-comment-actions className={styles.rowActions}>
              <DropdownMenu
                items={menuItems}
                placement={'bottomRight'}
                popupProps={{ style: { minWidth: 140 } }}
              >
                <ActionIcon
                  icon={MoreHorizontal}
                  loading={deleting}
                  size={'small'}
                  title={t('acceptance.comments.moreActions')}
                />
              </DropdownMenu>
            </div>
          )}
        </Flexbox>
        <div className={variant === 'boxed' ? styles.body : styles.panelBody}>
          {comment.deletedAt ? (
            <span className={styles.deleted}>{t('acceptance.comments.deleted')}</span>
          ) : (
            comment.content
          )}
          {/* Exhibits, under the words rather than inside them. */}
          {comment.attachments.length > 0 && (
            <div className={styles.attachments}>
              <AttachmentThumbs attachments={comment.attachments} />
            </div>
          )}
          {onReact && (
            <CommentReactions
              reactions={comment.reactions}
              onReact={reactable ? (emoji, on) => onReact(comment.id, emoji, on) : undefined}
            />
          )}
        </div>
      </>
    );
  },
);

CommentCard.displayName = 'AcceptanceCommentCard';

export default CommentCard;
