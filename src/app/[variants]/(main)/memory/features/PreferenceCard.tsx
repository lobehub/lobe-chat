'use client';

import { Progress, Tag } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { UserMemoryPreferencesWithoutVectors } from '@/database/schemas';

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
    display: flex;
    gap: 8px;
    align-items: center;

    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
  suggestions: css`
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

interface PreferenceCardProps {
  onClick?: () => void;
  preference: UserMemoryPreferencesWithoutVectors;
  showTimeline?: boolean;
}

const PreferenceCard = memo<PreferenceCardProps>(({ preference, onClick, showTimeline }) => {
  const { t } = useTranslation('memory');
  const { styles } = useStyles();

  const priority = preference.scorePriority ?? 0;

  const cardContent = (
    <Flexbox gap={8}>
      <Flexbox align="center" gap={8} horizontal justify="space-between">
        {preference.type && <span className={styles.typeTag}>{preference.type}</span>}
        <div className={styles.priority}>
          <Progress percent={priority * 10} showInfo={false} size="small" style={{ width: 40 }} />
          <Tag
            color={priority >= 7 ? 'red' : priority >= 4 ? 'orange' : 'default'}
            style={{ margin: 0 }}
          >
            {priority.toFixed(1)}
          </Tag>
        </div>
      </Flexbox>

      {preference.conclusionDirectives && (
        <div className={styles.content}>{preference.conclusionDirectives}</div>
      )}

      {preference.suggestions && <div className={styles.suggestions}>{preference.suggestions}</div>}

      {!showTimeline && (
        <div className={styles.footer}>
          <Flexbox align="center" horizontal justify="space-between">
            <span className={styles.time}>{t('preference.priority')}</span>
            {preference.createdAt && (
              <span className={styles.time}>{dayjs(preference.createdAt).fromNow()}</span>
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

export default PreferenceCard;
