import { Cell, Empty, Flexbox, Tag, useTheme } from '@lobehub/ui-rn';
import { MessageSquareDashed } from 'lucide-react-native';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { useFetchTopics } from '@/hooks/useFetchTopics';
import { useSwitchTopic } from '@/hooks/useSwitchSession';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';

import TopicItem from './TopicItem';

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

  // 如果是inbox且没有topics，显示提示信息
  if (activeId === 'inbox' && topics?.length === 0) {
    return (
      <Flexbox flex={1} justify={'center'}>
        <Empty description={t('empty')} />
      </Flexbox>
    );
  }

  return (
    <ScrollView
      removeClippedSubviews={true}
      scrollEventThrottle={32}
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
      }}
    >
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

      {/* 实际的topic列表项 */}
      {topics?.map((topic) => (
        <TopicItem key={topic.id} topic={topic} />
      ))}
    </ScrollView>
  );
});

TopicList.displayName = 'TopicList';

export default TopicList;
