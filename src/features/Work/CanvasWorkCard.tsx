'use client';

import type { WorkSummaryItem } from '@lobechat/types';
import { createStaticStyles, cx, Flexbox, Tag, Text } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const styles = createStaticStyles(({ css, cssVar }) => ({
  bar: css`
    height: 5px;
    border-radius: 2px;
    background: ${cssVar.colorFillSecondary};
  `,
  box: css`
    height: 16px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 3px;
    background: ${cssVar.colorBgContainer};
  `,
  card: css`
    overflow: hidden;

    width: 100%;
    max-width: 480px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadiusLG};

    background: ${cssVar.colorBgElevated};
  `,
  chart: css`
    height: 26px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 3px;
    background: linear-gradient(180deg, transparent 45%, ${cssVar.colorFillTertiary} 45%);
  `,
  clickable: css`
    cursor: pointer;

    &:hover {
      border-color: ${cssVar.colorBorder};
    }
  `,
  info: css`
    min-width: 0;
    padding-block: 12px;
    padding-inline: 14px;
  `,
  thumb: css`
    flex: none;

    width: 120px;
    padding: 10px;
    border-inline-end: 1px solid ${cssVar.colorBorderSecondary};

    background: ${cssVar.colorBgContainerSecondary};
  `,
}));

interface CanvasWorkCardProps {
  className?: string;
  item: WorkSummaryItem;
  onOpen?: () => void;
}

const CanvasWorkCard = memo<CanvasWorkCardProps>(({ className, item, onOpen }) => {
  const { t } = useTranslation('chat');
  const version = item.event.version;
  const updatedAt = new Date(item.event.createdAt ?? item.updatedAt).toLocaleString();

  return (
    <Flexbox
      horizontal
      className={cx(styles.card, onOpen && styles.clickable, className)}
      onClick={onOpen}
    >
      <Flexbox className={styles.thumb} gap={5}>
        <div className={styles.bar} style={{ height: 7, width: '70%' }} />
        <div className={styles.bar} style={{ width: '90%' }} />
        <Flexbox horizontal gap={4}>
          <div className={styles.box} style={{ flex: 1 }} />
          <div className={styles.box} style={{ flex: 1 }} />
          <div className={styles.box} style={{ flex: 1 }} />
        </Flexbox>
        <div className={styles.chart} />
        <div className={styles.bar} style={{ width: '80%' }} />
      </Flexbox>
      <Flexbox className={styles.info} flex={1} gap={4}>
        <Text ellipsis strong>
          {item.title || t('workingPanel.works.canvasUntitled')}
        </Text>
        {item.description && (
          <Text ellipsis={{ rows: 2 }} fontSize={12} type={'secondary'}>
            {item.description}
          </Text>
        )}
        <Flexbox horizontal align={'center'} gap={6} style={{ marginTop: 'auto' }}>
          <Tag size={'small'}>{`v${version}`}</Tag>
          <Text fontSize={12} type={'secondary'}>
            {updatedAt}
          </Text>
          {item.url && (
            <Tag color={'blue'} size={'small'}>
              {t('workingPanel.works.canvasPublished')}
            </Tag>
          )}
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

CanvasWorkCard.displayName = 'CanvasWorkCard';

export default CanvasWorkCard;
