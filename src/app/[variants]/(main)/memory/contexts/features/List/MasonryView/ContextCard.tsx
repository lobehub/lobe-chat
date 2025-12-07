'use client';

import { ActionIcon } from '@lobehub/ui';
import { Dropdown, Tag, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  AlertTriangle,
  Briefcase,
  CircleDot,
  Globe,
  Link2,
  MoreHorizontal,
  Pencil,
  Target,
  Trash2,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { KeyboardEvent, MouseEvent, ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DisplayContextMemory } from '@/database/repositories/userMemory';

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

      .context-card-actions {
        opacity: 1;
      }
    }
  `,
  description: css`
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
  scores: css`
    display: flex;
    gap: 8px;
    align-items: center;

    font-size: 12px;
    color: ${token.colorTextSecondary};
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
  status: css`
    padding-block: 4px;
    padding-inline: 8px;
    border-radius: ${token.borderRadiusSM}px;

    font-size: 12px;
    color: ${token.colorTextSecondary};

    background: ${token.colorFillTertiary};
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

      .context-card-actions {
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
    case 'goal': {
      return <Target size={iconSize} />;
    }
    case 'problem': {
      return <AlertTriangle size={iconSize} />;
    }
    case 'project': {
      return <Briefcase size={iconSize} />;
    }
    case 'relationship': {
      return <Users size={iconSize} />;
    }
    case 'situation': {
      return <Globe size={iconSize} />;
    }
    default: {
      return <CircleDot size={iconSize} />;
    }
  }
};

interface ContextCardProps {
  context: DisplayContextMemory;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  showTimeline?: boolean;
}

const ContextCard = memo<ContextCardProps>(
  ({ context, onClick, onDelete, onEdit, showTimeline }) => {
    const { t } = useTranslation('memory');
    const { styles, cx } = useStyles();

    const source = context.source;

    const handleMenuClick = (e: { domEvent: MouseEvent | KeyboardEvent; key: string }) => {
      e.domEvent.stopPropagation();
      if (e.key === 'delete' && onDelete) {
        onDelete(context.id);
      } else if (e.key === 'edit' && onEdit) {
        onEdit(context.id);
      }
    };

    const menuItems = [
      {
        icon: <Pencil size={14} />,
        key: 'edit',
        label: t('context.actions.edit'),
      },
      {
        danger: true,
        icon: <Trash2 size={14} />,
        key: 'delete',
        label: t('context.actions.delete'),
      },
    ];

    const cardContent = (
      <Flexbox gap={8}>
        <Flexbox align="center" gap={8} horizontal justify="space-between">
          {showTimeline ? (
            <>
              {context.title && <div className={styles.title}>{context.title}</div>}
              <Flexbox align="center" gap={8} horizontal>
                {context.type && (
                  <span className={styles.typeTag}>
                    {getTypeIcon(context.type)}
                    {context.type}
                  </span>
                )}
              </Flexbox>
            </>
          ) : (
            <>
              {context.type && (
                <span className={styles.typeTag}>
                  {getTypeIcon(context.type)}
                  {context.type}
                </span>
              )}
              {context.currentStatus && (
                <span className={styles.status}>{context.currentStatus}</span>
              )}
            </>
          )}
        </Flexbox>

        {!showTimeline && context.title && <div className={styles.title}>{context.title}</div>}

        {context.description && <div className={styles.description}>{context.description}</div>}

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
              <div className={styles.scores}>
                {context.scoreImpact !== null && context.scoreImpact !== undefined && (
                  <Tag color="blue">Impact: {((context.scoreImpact ?? 0) * 100).toFixed(0)}%</Tag>
                )}
                {context.scoreUrgency !== null && context.scoreUrgency !== undefined && (
                  <Tag color={(context.scoreUrgency ?? 0) >= 0.7 ? 'red' : 'orange'}>
                    Urgency: {((context.scoreUrgency ?? 0) * 100).toFixed(0)}%
                  </Tag>
                )}
              </div>
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
                {context.createdAt && (
                  <Tooltip title={dayjs(context.createdAt).format('YYYY-MM-DD HH:mm')}>
                    <span>{dayjs(context.createdAt).fromNow()}</span>
                  </Tooltip>
                )}
              </div>
            </Flexbox>
          </div>
        )}

        <Flexbox className={cx(styles.actions, 'context-card-actions')} gap={4} horizontal>
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

export default ContextCard;
