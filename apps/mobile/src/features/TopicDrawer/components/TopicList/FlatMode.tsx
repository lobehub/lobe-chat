import type { ChatTopic } from '@lobechat/types';
import { Cell, Tag, useTheme } from '@lobehub/ui-rn';
import { FlashList } from '@shopify/flash-list';
import { MessageSquareDashed } from 'lucide-react-native';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSwitchTopic } from '@/hooks/useSwitchSession';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';

import TopicItem from '../TopicItem';

type ListItem = { data: ChatTopic; type: 'topic' } | { type: 'default' };

/**
 * FlatMode - 平铺模式的 Topic 列表
 * 所有 topics 在一个列表中平铺展示
 */
const FlatMode = memo(() => {
  const { t } = useTranslation('topic');
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const topics = useChatStore((s) => topicSelectors.displayTopics(s));
  const activeTopicId = useChatStore((s) => s.activeTopicId);
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
  const listKey = useMemo(() => {
    if (!topics || topics.length === 0) return 'empty';
    return topics.map((t) => `${t.id}-${t.favorite ? '1' : '0'}`).join('_');
  }, [topics]);

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
      contentContainerStyle={{
        paddingBottom: insets.bottom,
      }}
      data={listData}
      drawDistance={400}
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

FlatMode.displayName = 'FlatMode';

export default FlatMode;
