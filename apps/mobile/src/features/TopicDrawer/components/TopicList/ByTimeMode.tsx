import type { ChatTopic, GroupedTopic } from '@lobechat/types';
import { Cell, Tag, useTheme } from '@lobehub/ui-rn';
import { FlashList } from '@shopify/flash-list';
import { MessageSquareDashed } from 'lucide-react-native';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSwitchTopic } from '@/hooks/useSwitchSession';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';

import TopicItem from '../TopicItem';
import GroupItem from './GroupItem';

type ListItem =
  | { data: ChatTopic; type: 'topic' }
  | { data: GroupedTopic; type: 'group' }
  | { type: 'default' };

/**
 * ByTimeMode - 时间分组模式的 Topic 列表
 * Topics 按时间分组展示（收藏、今天、昨天、本周等）
 */
const ByTimeMode = memo(() => {
  const { t } = useTranslation('topic');
  const theme = useTheme();

  const groupedTopics = useChatStore((s) => topicSelectors.groupedTopicsSelector(s));
  const activeTopicId = useChatStore((s) => s.activeTopicId);
  const setTopicDrawerOpen = useGlobalStore((s) => s.setTopicDrawerOpen);
  const switchTopic = useSwitchTopic();

  // 构建 FlashList 数据源：包含默认项、分组标题和 topics
  const listData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];

    // 添加默认项
    items.push({ type: 'default' });

    // 添加分组和 topics
    if (groupedTopics && groupedTopics.length > 0) {
      groupedTopics.forEach((group) => {
        // 添加分组标题
        items.push({ data: group, type: 'group' });

        // 添加该分组下的所有 topics
        group.children.forEach((topic) => {
          items.push({ data: topic, type: 'topic' });
        });
      });
    }

    return items;
  }, [groupedTopics]);

  // 生成一个key来强制FlashList在数据结构变化时重新渲染
  const listKey = useMemo(() => {
    if (!groupedTopics || groupedTopics.length === 0) return 'empty';
    return groupedTopics
      .map((g) => `${g.id}-${g.children.map((t) => `${t.id}-${t.favorite ? '1' : '0'}`).join('_')}`)
      .join('|');
  }, [groupedTopics]);

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

    if (item.type === 'group') {
      return <GroupItem id={item.data.id} title={item.data.title} />;
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
      drawDistance={400}
      extraData={groupedTopics}
      getItemType={getItemType}
      key={listKey}
      keyExtractor={(item, index) => {
        if (item.type === 'topic') {
          return item.data.id;
        }
        if (item.type === 'group') {
          return `group-${item.data.id}`;
        }
        return `default-${index}`;
      }}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    />
  );
});

ByTimeMode.displayName = 'ByTimeMode';

export default ByTimeMode;
