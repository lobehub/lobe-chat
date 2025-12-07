'use client';

import { ActionIcon } from '@lobehub/ui';
import { Dropdown, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  AlertCircle,
  BookOpen,
  CircleDot,
  Code2,
  Heart,
  Link2,
  MoreHorizontal,
  Pencil,
  Settings,
  Trash2,
  Utensils,
} from 'lucide-react';
import Link from 'next/link';
import { KeyboardEvent, MouseEvent, ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DisplayPreferenceMemory } from '@/database/repositories/userMemory';

dayjs.extend(relativeTime);

const useStyles = createStyles(({ css, token }) => ({
  actions: css`
    position: absolute;
    inset-block-end: 12px;
    inset-inline-end: 16px;

    opacity: 0;

    transition: opacity 0.15s ease;
  `,
  card: css`
    cursor: pointer;

    position: relative;

    padding: 16px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};

    transition: all 0.2s ease;

    &:hover {
      border-color: ${token.colorPrimary};
      box-shadow: 0 2px 8px rgba(0, 0, 0, 8%);

      .preference-card-actions {
        opacity: 1;
      }
    }
  `,
  conclusionDirectives: css`
    flex: 1;
    font-size: 13px;
    line-height: 1.6;
    color: ${token.colorTextSecondary};
  `,
  footer: css`
    margin-block-start: 12px;
    padding-block-start: 12px;
    border-block-start: 1px solid ${token.colorBorderSecondary};
  `,
  priority: css`
    font-size: 11px;
    color: ${token.colorTextQuaternary};
  `,
  sourceInfo: css`
    display: flex;
    gap: 8px;
    align-items: center;

    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  sourceTag: css`
    display: inline-flex;
    gap: 4px;
    align-items: center;

    font-size: 12px;
    color: ${token.colorTextTertiary};

    &:hover {
      color: ${token.colorTextSecondary};
    }
  `,
  timelineCard: css`
    position: relative;

    padding-block: 12px;
    padding-inline: 16px;
    border-radius: ${token.borderRadius}px;

    background: ${token.colorBgContainer};

    transition: all 0.15s ease;

    &:hover {
      background: ${token.colorFillQuaternary};

      .preference-card-actions {
        opacity: 1;
      }
    }
  `,
  timelineDot: css`
    position: absolute;
    inset-block-start: 16px;
    inset-inline-start: -20px;

    width: 8px;
    height: 8px;
    border: 2px solid ${token.colorBgContainer};
    border-radius: 50%;

    background: ${token.colorFill};
  `,
  timelineLine: css`
    position: absolute;
    inset-block-start: 20px;
    inset-inline-start: -12px;

    width: 14px;
    height: 1px;

    background: ${token.colorBorderSecondary};
  `,
  title: css`
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    color: ${token.colorText};
  `,
  typeTag: css`
    display: inline-flex;
    gap: 6px;
    align-items: center;

    padding-block: 4px;
    padding-inline: 10px;
    border-radius: ${token.borderRadiusSM}px;

    font-size: 12px;
    font-weight: 500;
    color: ${token.colorPrimary};

    background: ${token.colorPrimaryBg};
  `,
}));

const getTypeIcon = (type: string | null): ReactNode => {
  const iconSize = 14;
  switch (type?.toLowerCase()) {
    case 'coding': {
      return <Code2 size={iconSize} />;
    }
    case 'communication': {
      return <BookOpen size={iconSize} />;
    }
    case 'food': {
      return <Utensils size={iconSize} />;
    }
    case 'health': {
      return <Heart size={iconSize} />;
    }
    case 'preference': {
      return <Settings size={iconSize} />;
    }
    case 'warning': {
      return <AlertCircle size={iconSize} />;
    }
    default: {
      return <CircleDot size={iconSize} />;
    }
  }
};

interface PreferenceCardProps {
  onClick: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  preference: DisplayPreferenceMemory;
  showTimeline?: boolean;
}

const PreferenceCard = memo<PreferenceCardProps>(
  ({ preference, onClick, onDelete, onEdit, showTimeline }) => {
    const { t } = useTranslation('memory');
    const { styles, cx } = useStyles();

    const priority = preference.scorePriority ?? 0;
    const source = preference.source;

    // Use title if available (from userMemories table)
    const displayTitle = preference.title;

    const handleMenuClick = (e: { domEvent: MouseEvent | KeyboardEvent; key: string }) => {
      e.domEvent.stopPropagation();
      if (e.key === 'delete' && onDelete) {
        onDelete(preference.id);
      } else if (e.key === 'edit' && onEdit) {
        onEdit(preference.id);
      }
    };

    const menuItems = [
      {
        icon: <Pencil size={14} />,
        key: 'edit',
        label: t('preference.actions.edit'),
      },
      {
        danger: true,
        icon: <Trash2 size={14} />,
        key: 'delete',
        label: t('preference.actions.delete'),
      },
    ];

    const cardContent = (
      <Flexbox gap={8}>
        <Flexbox align="center" gap={8} horizontal justify="space-between">
          {showTimeline ? (
            <>
              {displayTitle && <div className={styles.title}>{displayTitle}</div>}
              <Flexbox align="center" gap={8} horizontal>
                {preference.type && (
                  <span className={styles.typeTag}>
                    {getTypeIcon(preference.type)}
                    {preference.type}
                  </span>
                )}
                <Tooltip title={`${t('preference.priority')}: ${(priority * 100).toFixed(0)}%`}>
                  <span className={styles.priority}>{(priority * 100).toFixed(0)}%</span>
                </Tooltip>
              </Flexbox>
            </>
          ) : (
            <>
              {preference.type && (
                <span className={styles.typeTag}>
                  {getTypeIcon(preference.type)}
                  {preference.type}
                </span>
              )}
              <Tooltip title={`${t('preference.priority')}: ${(priority * 100).toFixed(0)}%`}>
                <span className={styles.priority}>{(priority * 100).toFixed(0)}%</span>
              </Tooltip>
            </>
          )}
        </Flexbox>

        {!showTimeline && displayTitle && <div className={styles.title}>{displayTitle}</div>}

        {preference.conclusionDirectives && (
          <div className={styles.conclusionDirectives}>{preference.conclusionDirectives}</div>
        )}

        {showTimeline ? (
          <div className={styles.sourceInfo}>
            {source && (
              <Tooltip title={source.topicTitle || `Topic: ${source.topicId}`}>
                <Link
                  className={styles.sourceTag}
                  href={`/agent/${source.agentId}?topicId=${source.topicId}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link2 size={12} />
                  {source.topicTitle || source.topicId.replace('tpc_', '').slice(0, 8)}
                </Link>
              </Tooltip>
            )}
          </div>
        ) : (
          <div className={styles.footer}>
            <Flexbox align="center" horizontal justify="space-between">
              <div className={styles.sourceInfo}>
                {source && (
                  <Tooltip title={source.topicTitle || `Topic: ${source.topicId}`}>
                    <Link
                      className={styles.sourceTag}
                      href={`/agent/${source.agentId}?topicId=${source.topicId}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link2 size={12} />
                      {source.topicTitle || source.topicId.replace('tpc_', '').slice(0, 8)}
                    </Link>
                  </Tooltip>
                )}
                {preference.createdAt && (
                  <Tooltip title={dayjs(preference.createdAt).format('YYYY-MM-DD HH:mm')}>
                    <span>{dayjs(preference.createdAt).fromNow()}</span>
                  </Tooltip>
                )}
              </div>
            </Flexbox>
          </div>
        )}

        <Flexbox className={cx(styles.actions, 'preference-card-actions')} gap={4} horizontal>
          <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
            <ActionIcon icon={MoreHorizontal} onClick={(e) => e.stopPropagation()} size="small" />
          </Dropdown>
        </Flexbox>
      </Flexbox>
    );

    if (showTimeline) {
      return (
        <div style={{ position: 'relative' }}>
          <div className={styles.timelineLine} />
          <div className={styles.timelineDot} />
          <div className={styles.timelineCard} onClick={onClick}>
            {cardContent}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.card} onClick={onClick}>
        {cardContent}
      </div>
    );
  },
);

export default PreferenceCard;
