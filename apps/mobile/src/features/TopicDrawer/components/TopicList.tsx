import type { ChatTopic } from '@lobechat/types';
import { Cell, Empty, Flexbox, Tag, useTheme } from '@lobehub/ui-rn';
import { FlashList } from '@shopify/flash-list';
import { MessageSquareDashed } from 'lucide-react-native';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFetchTopics } from '@/hooks/useFetchTopics';
import { useSwitchTopic } from '@/hooks/useSwitchSession';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';

import TopicItem from './TopicItem';
import TopicItemSkeleton from './TopicItemSkeleton';

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

type ListItem = { data: ChatTopic; type: 'topic' } | { type: 'default' };

/**
 * TopicList - Topic列表组件
 * 展示当前会话下的所有话题
 */
const TopicList = memo(() => {
  const { t } = useTranslation('topic');
  const theme = useTheme();

  // 获取当前会话的topics - 参考web端实现
  useFetchTopics();

  const topics = useChatStore((s) => topicSelectors.currentTopics(s));
  const topicsInit = useChatStore((s) => s.topicsInit);
  const activeTopicId = useChatStore((s) => s.activeTopicId);
  const activeId = useSessionStore((s) => s.activeId);
  const setTopicDrawerOpen = useGlobalStore((s) => s.setTopicDrawerOpen);
  const switchTopic = useSwitchTopic();

  // 构建 FlashList 数据源：包含默认项和 topics
  const listData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];

    // 添加默认项
    items.push({ type: 'default' });

    // 添加 topics
    if (topics) {
      topics.forEach((topic) => {
        items.push({ data: topic, type: 'topic' });
      });
    }

    return items;
  }, [topics]);

  // 生成一个key来强制FlashList在数据结构变化时重新渲染
  // 基于topics的id和favorite状态，确保排序变化时会触发重新渲染
  const listKey = useMemo(() => {
    if (!topics || topics.length === 0) return 'empty';
    return topics.map((t) => `${t.id}-${t.favorite ? '1' : '0'}`).join('_');
  }, [topics]);

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

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'default') {
      return (
        <Cell
          active={!activeTopicId}
          extra={<Tag>{t('temp')}</Tag>}
          icon={MessageSquareDashed}
          iconProps={{
            color: theme.colorTextDescription,
          }}
          iconSize={16}
          onPress={() => {
            switchTopic(); // 切换到默认topic (null)
            setTopicDrawerOpen(false);
          }}
          showArrow={false}
          title={t('defaultTitle')}
          titleProps={{
            fontSize: 14,
          }}
        />
      );
    }

    // topic item
    return <TopicItem topic={item.data} />;
  };

  const getItemType = (item: ListItem) => {
    return item.type;
  };

  return (
    <FlashList
      contentContainerStyle={{ paddingTop: 0 }}
      data={listData}
      extraData={topics}
      getItemType={getItemType}
      key={listKey}
      keyExtractor={(item, index) => {
        if (item.type === 'topic') {
          return item.data.id;
        }
        return `default-${index}`;
      }}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    />
  );
});

TopicList.displayName = 'TopicList';

export default TopicList;
