import { Block, Flexbox, Text } from '@lobehub/ui-rn';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useSwitchTopic } from '@/hooks/useSwitchSession';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';

const RecentTopics = memo(() => {
  const { t } = useTranslation('welcome');
  const topics = useChatStore(topicSelectors.currentTopics);
  const switchTopic = useSwitchTopic();

  const handleTopicPress = useCallback(
    (topicId: string) => {
      switchTopic(topicId);
    },
    [switchTopic],
  );

  // 获取最近的 4 条 topics（按创建时间倒序）
  const recentTopics = topics
    ?.slice()
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 4);

  if (!recentTopics || recentTopics.length === 0) return null;

  return (
    <Flexbox gap={16}>
      <Text type={'secondary'}>{t('guide.topics.title', { ns: 'welcome' })}</Text>
      <Flexbox gap={8} horizontal wrap={'wrap'}>
        {recentTopics.map((topic) => (
          <Block
            key={topic.id}
            onPress={() => handleTopicPress(topic.id)}
            padding={12}
            pressEffect
            variant={'outlined'}
          >
            <Text>{topic.title || t('topic:defaultTitle')}</Text>
          </Block>
        ))}
      </Flexbox>
    </Flexbox>
  );
});

RecentTopics.displayName = 'RecentTopics';

export default RecentTopics;
