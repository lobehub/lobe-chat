'use client';

import { Tag } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { UserMemoryContextsWithoutVectors } from '@/database/schemas';

dayjs.extend(relativeTime);

const useStyles = createStyles(({ css, token }) => ({
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
    }
  `,
  content: css`
    flex: 1;
    font-size: 14px;
    line-height: 1.6;
    color: ${token.colorText};
  `,
  footer: css`
    margin-block-start: 12px;
    padding-block-start: 12px;
    border-block-start: 1px solid ${token.colorBorderSecondary};
  `,
  scores: css`
    display: flex;
    gap: 12px;
    align-items: center;

    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
  status: css`
    padding-block: 8px;
    padding-inline: 12px;
    border-radius: ${token.borderRadiusSM}px;

    font-size: 13px;
    color: ${token.colorTextSecondary};

    background: ${token.colorFillTertiary};
  `,
  time: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
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

interface ContextCardProps {
  context: UserMemoryContextsWithoutVectors;
  onClick?: () => void;
  showTimeline?: boolean;
}

const ContextCard = memo<ContextCardProps>(({ context, onClick, showTimeline }) => {
  const { styles } = useStyles();

  const cardContent = (
    <Flexbox gap={8} style={{ height: '100%' }}>
      <Flexbox align="center" gap={8} horizontal justify="space-between">
        {context.type && <span className={styles.typeTag}>{context.type}</span>}
        {context.title && <span className={styles.title}>{context.title}</span>}
      </Flexbox>

      {context.description && <div className={styles.content}>{context.description}</div>}

      {context.currentStatus && <div className={styles.status}>{context.currentStatus}</div>}

      {!showTimeline && (
        <div className={styles.footer}>
          <Flexbox align="center" horizontal justify="space-between">
            <div className={styles.scores}>
              {context.scoreImpact !== null && (
                <Tag color="blue">Impact: {(context.scoreImpact * 10).toFixed(0)}%</Tag>
              )}
              {context.scoreUrgency !== null && (
                <Tag color={context.scoreUrgency >= 0.7 ? 'red' : 'orange'}>
                  Urgency: {(context.scoreUrgency * 10).toFixed(0)}%
                </Tag>
              )}
            </div>
            {context.createdAt && (
              <span className={styles.time}>{dayjs(context.createdAt).fromNow()}</span>
            )}
          </Flexbox>
        </div>
      )}
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
});

export default ContextCard;
