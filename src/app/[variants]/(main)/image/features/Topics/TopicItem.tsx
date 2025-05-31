'use client';

import { Avatar, Tooltip } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ImageGenerationTopic } from '@/types/generation';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    border-radius: 6px;
    overflow: hidden;

    &:hover {
      transform: scale(1.05);
    }
  `,
  tooltipContent: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 12px;
    min-width: 150px;
  `,
  title: css`
    font-size: 14px;
    font-weight: 500;
    color: ${token.colorText};
    margin: 0;
  `,
  time: css`
    font-size: 12px;
    color: ${token.colorTextSecondary};
    margin: 0;
  `,
}));

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

interface TopicItemProps {
  topic: ImageGenerationTopic;
}

const TopicItem = memo<TopicItemProps>(({ topic }) => {
  const { t } = useTranslation('image');
  const { styles } = useStyles();

  const handleClick = () => {
    // TODO: 切换到对应的 topic
    console.log('Switch to topic:', topic.id);
  };

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <h4 className={styles.title}>{topic.title || t('topic.untitled')}</h4>
      <p className={styles.time}>{formatTime(topic.updatedAt)}</p>
    </div>
  );

  return (
    <Tooltip arrow={false} placement="left" title={tooltipContent}>
      <div className={styles.container} onClick={handleClick}>
        <Avatar
          avatar={topic.imageUrl}
          size={50}
          style={{ borderRadius: 6 }}
          title={topic.title || t('topic.untitled')}
        />
      </div>
    </Tooltip>
  );
});

TopicItem.displayName = 'TopicItem';

export default TopicItem;
