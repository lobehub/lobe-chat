'use client';

import { ActionIcon, Avatar } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import { Trash } from 'lucide-react';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { useImageStore } from '@/store/image';
import { generationTopicSelectors } from '@/store/image/slices/generationTopic/selectors';
import { ImageGenerationTopic } from '@/types/generation';

import TopicItemContainer from './TopicItemContainer';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow: hidden;
  `,
  deleteButton: css`
    color: ${token.colorTextSecondary};
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  `,
  time: css`
    flex: 1;
    margin: 0;
    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
  timeRow: css`
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
  `,
  title: css`
    margin: 0;
    font-size: 14px;
    font-weight: 500;
  `,
  tooltipContent: css`
    display: flex;
    flex-direction: column;
    gap: 4px;

    min-width: 150px;
    padding-block: 8px;
    padding-inline: 12px;
    border-radius: ${token.borderRadius}px;
  `,
  tooltipContentHover: css`
    &:hover .delete-button {
      opacity: 1;
    }
  `,
}));

const formatTime = (date: Date, locale: string) => {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

interface TopicItemProps {
  topic: ImageGenerationTopic;
}

const TopicItem = memo<TopicItemProps>(({ topic }) => {
  const theme = useTheme();
  const { t } = useTranslation('image');
  const { styles, cx } = useStyles();
  const { modal } = App.useApp();
  const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);

  // 检查当前 topic 是否在加载中
  const isLoading = useImageStore(generationTopicSelectors.isLoadingGenerationTopic(topic.id));
  const removeGenerationTopic = useImageStore((s) => s.removeGenerationTopic);
  const switchGenerationTopic = useImageStore((s) => s.switchGenerationTopic);
  const activeTopicId = useImageStore(generationTopicSelectors.activeGenerationTopicId);

  const isActive = activeTopicId === topic.id;

  const handleClick = () => {
    switchGenerationTopic(topic.id);
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
    <div className={cx(styles.tooltipContent, styles.tooltipContentHover)}>
      <h4 className={styles.title}>{topic.title || t('topic.untitled')}</h4>
      <div className={styles.timeRow}>
        <p className={styles.time}>{formatTime(topic.updatedAt, locale)}</p>
        <ActionIcon
          className={cx(styles.deleteButton, 'delete-button')}
          danger
          icon={Trash}
          onClick={handleDelete}
          size="small"
        />
      </div>
    </div>
  );

  return (
    <TopicItemContainer
      active={isActive}
      className={styles.container}
      onClick={handleClick}
      tooltip={tooltipContent}
    >
      <Avatar
        avatar={topic.coverUrl ?? ''}
        background={theme.colorBgElevated}
        bordered={isActive}
        loading={isLoading}
        shape="square"
        size={50}
      />
    </TopicItemContainer>
  );
});

TopicItem.displayName = 'TopicItem';

export default TopicItem;
