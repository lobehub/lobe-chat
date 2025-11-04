import { Block, Flexbox, Skeleton, Text } from '@lobehub/ui-rn';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 最近 Topics 的骨架屏组件
 * 在 topics 加载时显示
 */
const RecentTopicsSkeleton = memo(() => {
  const { t } = useTranslation('welcome');
  const widths = [100, 120]; // 固定宽度，模拟不同长度的 topic 标题

  return (
    <Flexbox gap={16}>
      <Text type={'secondary'}>{t('guide.topics.title', { ns: 'welcome' })}</Text>
      <Flexbox gap={8} horizontal wrap={'wrap'}>
        {widths.map((width, index) => (
          <Block key={index} padding={12} variant={'outlined'}>
            <Skeleton
              animated
              paragraph={{
                rows: 1,
                width: [width],
              }}
              title={false}
            />
          </Block>
        ))}
      </Flexbox>
    </Flexbox>
  );
});

RecentTopicsSkeleton.displayName = 'RecentTopicsSkeleton';

export default RecentTopicsSkeleton;
