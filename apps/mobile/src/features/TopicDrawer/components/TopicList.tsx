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
            color: theme.colorTextSecondary,
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
      data={listData}
      getItemType={getItemType}
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
