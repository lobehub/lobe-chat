import { ActionIcon } from '@lobehub/ui';
import { Dropdown, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Calendar,
  CircleDot,
  Cpu,
  FileText,
  Link2,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Settings,
  Sparkles,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { KeyboardEvent, MouseEvent, ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DisplayExperienceMemory } from '@/database/repositories/userMemory';

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

    padding: 16px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};

    transition: all 0.2s ease;

    &:hover {
      border-color: ${token.colorPrimary};
      box-shadow: 0 2px 8px rgba(0, 0, 0, 8%);

      .experience-card-actions {
        opacity: 1;
      }
    }
  `,
  confidence: css`
    font-size: 11px;
    color: ${token.colorTextQuaternary};
  `,
  footer: css`
    margin-block-start: 12px;
    padding-block-start: 12px;
    border-block-start: 1px solid ${token.colorBorderSecondary};
  `,
  keyLearning: css`
    flex: 1;
    font-size: 13px;
    line-height: 1.6;
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
  timelineCard: css`
    position: relative;

    padding-block: 12px;
    padding-inline: 16px;
    border-radius: ${token.borderRadius}px;

    background: ${token.colorBgContainer};

    transition: all 0.15s ease;

    &:hover {
      background: ${token.colorFillQuaternary};

      .experience-card-actions {
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
    case 'activity': {
      return <Zap size={iconSize} />;
    }
    case 'context': {
      return <MessageSquare size={iconSize} />;
    }
    case 'event': {
      return <Calendar size={iconSize} />;
    }
    case 'fact': {
      return <FileText size={iconSize} />;
    }
    case 'location': {
      return <MapPin size={iconSize} />;
    }
    case 'people': {
      return <Users size={iconSize} />;
    }
    case 'preference': {
      return <Settings size={iconSize} />;
    }
    case 'technology': {
      return <Cpu size={iconSize} />;
    }
    case 'topic': {
      return <Sparkles size={iconSize} />;
    }
    default: {
      return <CircleDot size={iconSize} />;
    }
  }
};

interface ExperienceCardProps {
  experience: DisplayExperienceMemory;
  onClick: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  showTimeline?: boolean;
}

const ExperienceCard = memo<ExperienceCardProps>(
  ({ experience, onClick, onDelete, onEdit, showTimeline }) => {
    const { t } = useTranslation('memory');
    const { styles, cx } = useStyles();

    const confidence = experience.scoreConfidence ?? 0;
    const source = experience.source;

    const handleMenuClick = (e: { domEvent: MouseEvent | KeyboardEvent; key: string }) => {
      e.domEvent.stopPropagation();
      if (e.key === 'delete' && onDelete) {
        onDelete(experience.id);
      } else if (e.key === 'edit' && onEdit) {
        onEdit(experience.id);
      }
    };

    const menuItems = [
      {
        icon: <Pencil size={14} />,
        key: 'edit',
        label: t('experience.actions.edit'),
      },
      {
        danger: true,
        icon: <Trash2 size={14} />,
        key: 'delete',
        label: t('experience.actions.delete'),
      },
    ];

    const cardContent = (
      <Flexbox gap={8}>
        <Flexbox align="center" gap={8} horizontal justify="space-between">
          {showTimeline ? (
            <>
              {experience.title && <div className={styles.title}>{experience.title}</div>}
              <Flexbox align="center" gap={8} horizontal>
                {experience.type && (
                  <span className={styles.typeTag}>
                    {getTypeIcon(experience.type)}
                    {experience.type}
                  </span>
                )}
                <Tooltip title={`${t('experience.confidence')}: ${(confidence * 100).toFixed(0)}%`}>
                  <span className={styles.confidence}>{(confidence * 100).toFixed(0)}%</span>
                </Tooltip>
              </Flexbox>
            </>
          ) : (
            <>
              {experience.type && (
                <span className={styles.typeTag}>
                  {getTypeIcon(experience.type)}
                  {experience.type}
                </span>
              )}
              <Tooltip title={`${t('experience.confidence')}: ${(confidence * 100).toFixed(0)}%`}>
                <span className={styles.confidence}>{(confidence * 100).toFixed(0)}%</span>
              </Tooltip>
            </>
          )}
        </Flexbox>

        {!showTimeline && experience.title && (
          <div className={styles.title}>{experience.title}</div>
        )}

        {experience.keyLearning && (
          <div className={styles.keyLearning}>{experience.keyLearning}</div>
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
                      href={
                        source.agentId
                          ? `/agent/${source.agentId}?topicId=${source.topicId}`
                          : `/chat?session=inbox&topic=${source.topicId}`
                      }
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link2 size={12} />
                      {source.topicTitle || source.topicId.replace('tpc_', '').slice(0, 8)}
                    </Link>
                  </Tooltip>
                )}
                {experience.createdAt && (
                  <Tooltip title={dayjs(experience.createdAt).format('YYYY-MM-DD HH:mm')}>
                    <span>{dayjs(experience.createdAt).fromNow()}</span>
                  </Tooltip>
                )}
              </div>
            </Flexbox>
          </div>
        )}

        <Flexbox className={cx(styles.actions, 'experience-card-actions')} gap={4} horizontal>
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

export default ExperienceCard;
