import type { ChatTopic } from '@lobechat/types';
import { Center, Empty, Flexbox } from '@lobehub/ui-rn';
import type { FlashListRef } from '@shopify/flash-list';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { MessageSquareOff } from 'lucide-react-native';
import { forwardRef, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InteractionManager } from 'react-native';

import TopicItem from '@/features/TopicDrawer/components/TopicItem';
import TopicItemSkeleton from '@/features/TopicDrawer/components/TopicItemSkeleton';
import { useSwitchTopic } from '@/hooks/useSwitchSession';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';

// 骨架屏列表
const TopicSkeletonList = memo(() => {
  return (
    <Flexbox paddingBlock={16}>
      {['100%', '100%', '60%', '100%', '80%', '100%', '100%', '60%'].map((width, index) => (
        <TopicItemSkeleton key={index} width={width as any} />
      ))}
    </Flexbox>
  );
});

TopicSkeletonList.displayName = 'TopicSkeletonList';

interface TopicSearchListProps {
  searchText: string;
}

const TopicSearchList = memo(
  forwardRef<FlashListRef<any>, TopicSearchListProps>(({ searchText }, ref) => {
    const { t } = useTranslation('topic');
    const router = useRouter();
    const activeId = useSessionStore((s) => s.activeId);
    const useSearchTopics = useChatStore((s) => s.useSearchTopics);
    const switchTopic = useSwitchTopic();
    const setTopicDrawerOpen = useGlobalStore((s) => s.setTopicDrawerOpen);

    const keyword = searchText.trim();

    // 搜索 topics
    const { data: topics, isLoading } = useSearchTopics(keyword, activeId);

    // 过滤并排序 topics
    const filteredTopics = useMemo(() => {
      if (!topics || topics.length === 0) return [];

      // 按更新时间排序（最新的在前）
      return [...topics].sort((a, b) => {
        const aTime = a.updatedAt || a.createdAt;
        const bTime = b.updatedAt || b.createdAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
    }, [topics]);

    // 处理 topic 点击
    const handleTopicPress = useCallback(
      (topicId: string) => {
        // 1. 先返回上一页（关闭搜索页面）
        router.back();
        // 2. 切换到选中的 topic
        InteractionManager.runAfterInteractions(() => {
          switchTopic(topicId);
          // 3. 关闭 topic drawer
          setTopicDrawerOpen(false);
        });
      },
      [router, switchTopic, setTopicDrawerOpen],
    );

    // 渲染列表项
    const renderItem = useCallback(
      ({ item }: { item: ChatTopic }) => (
        <TopicItem onPress={() => handleTopicPress(item.id)} topic={item} />
      ),
      [handleTopicPress],
    );

    // 键提取器
    const keyExtractor = useCallback((item: ChatTopic) => item.id, []);

    // 空状态
    const renderEmptyComponent = useCallback(
      () => (
        <Center paddingBlock={48}>
          <Empty
            description={keyword ? t('search.emptyResult') : t('search.placeholder')}
            icon={MessageSquareOff}
          />
        </Center>
      ),
      [keyword, t],
    );

    // 加载中显示骨架屏
    if (isLoading) {
      return <TopicSkeletonList />;
    }

    return (
      <FlashList
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={{
          paddingBlock: 16,
        }}
        data={filteredTopics}
        drawDistance={400}
        keyExtractor={keyExtractor}
        ref={ref}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    );
  }),
);

TopicSearchList.displayName = 'TopicSearchList';

export default TopicSearchList;
