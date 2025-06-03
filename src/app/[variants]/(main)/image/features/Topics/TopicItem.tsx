'use client';

import { ActionIcon, Avatar, Tooltip } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import { Trash } from 'lucide-react';
import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useImageStore } from '@/store/image';
import { generationTopicSelectors } from '@/store/image/slices/generationTopic/selectors';
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
    background: ${token.colorBgElevated};
    border-radius: ${token.borderRadius}px;
  `,
  title: css`
    font-size: 14px;
    font-weight: 500;
    color: ${token.colorText};
    margin: 0;
  `,
  timeRow: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  `,
  time: css`
    font-size: 12px;
    color: ${token.colorTextSecondary};
    margin: 0;
    flex: 1;
  `,
  deleteButton: css`
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  `,
  tooltipContentHover: css`
    &:hover .delete-button {
      opacity: 1;
    }
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
  const { styles, cx } = useStyles();
  const { modal } = App.useApp();
  const [isHovered, setIsHovered] = useState(false);

  // 检查当前 topic 是否在加载中
  const isLoading = useImageStore(generationTopicSelectors.isLoadingGenerationTopic(topic.id));
  const removeGenerationTopic = useImageStore((s) => s.removeGenerationTopic);

  const handleClick = () => {
    // TODO: 切换到对应的 topic
    console.log('Switch to topic:', topic.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    modal.confirm({
      title: t('topic.deleteConfirm'),
      content: t('topic.deleteConfirmDesc'),
      okText: t('delete', { ns: 'common' }),
      cancelText: t('cancel', { ns: 'common' }),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await removeGenerationTopic(topic.id);
        } catch (error) {
          console.error('Delete topic failed:', error);
        }
      },
    });
  };

  const tooltipContent = (
    <div
      className={cx(styles.tooltipContent, styles.tooltipContentHover)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h4 className={styles.title}>{topic.title || t('topic.untitled')}</h4>
      <div className={styles.timeRow}>
        <p className={styles.time}>{formatTime(topic.updatedAt)}</p>
        <ActionIcon
          className={cx(styles.deleteButton, 'delete-button')}
          danger
          icon={Trash}
          onClick={handleDelete}
          size="small"
          style={{ opacity: isHovered ? 1 : 0 }}
        />
      </div>
    </div>
  );

  return (
    <Tooltip arrow={false} placement="left" title={tooltipContent}>
      <div className={styles.container} onClick={handleClick}>
        <Avatar avatar={topic.imageUrl} loading={isLoading} size={50} style={{ borderRadius: 6 }} />
      </div>
    </Tooltip>
  );
});

TopicItem.displayName = 'TopicItem';

export default TopicItem;
