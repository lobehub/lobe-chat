import { TopicDisplayMode } from '@lobechat/types';
import { Empty, Flexbox } from '@lobehub/ui-rn';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFetchTopics } from '@/hooks/useFetchTopics';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { useSettingStore } from '@/store/setting';

import TopicItemSkeleton from './TopicItemSkeleton';
import ByTimeMode from './TopicList/ByTimeMode';
import FlatMode from './TopicList/FlatMode';

// 骨架屏列表
const TopicSkeletonList = memo(() => {
  return (
    <Flexbox>
      {['100%', '100%', '60%', '100%', '80%', '100%', '100%', '60%'].map((width, index) => (
        <TopicItemSkeleton key={index} width={width as any} />
      ))}
    </Flexbox>
  );
});

TopicSkeletonList.displayName = 'TopicSkeletonList';

/**
 * TopicList - Topic列表组件
 * 展示当前会话下的所有话题
 * 支持平铺模式和时间分组模式
 */
const TopicList = memo(() => {
  const { t } = useTranslation('topic');

  // 获取当前会话的topics - 参考web端实现
  useFetchTopics();

  const topics = useChatStore((s) => topicSelectors.currentTopics(s));
  const topicsInit = useChatStore((s) => s.topicsInit);
  const activeId = useSessionStore((s) => s.activeId);
  const topicDisplayMode = useSettingStore((s) => s.topicDisplayMode);

  // 加载中显示骨架屏
  if (!topicsInit) {
    return <TopicSkeletonList />;
  }

  // 如果是inbox且没有topics，显示提示信息
  if (activeId === 'inbox' && topics?.length === 0) {
    return (
      <Flexbox flex={1} justify={'center'}>
        <Empty description={t('empty')} />
      </Flexbox>
    );
  }

  // 根据显示模式切换不同的列表组件
  return topicDisplayMode === TopicDisplayMode.ByTime ? <ByTimeMode /> : <FlatMode />;
});

TopicList.displayName = 'TopicList';

export default TopicList;
