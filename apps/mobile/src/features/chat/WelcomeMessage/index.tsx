import isEqual from 'fast-deep-equal';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { useFetchTopics } from '@/hooks/useFetchTopics';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

import WelcomeChatBubble from '../ChatBubble/Welcome';
import OpeningQuestions from './OpeningQuestions';
import RecentTopics from './RecentTopics';
import RecentTopicsSkeleton from './RecentTopicsSkeleton';

const WelcomeMessage = () => {
  const { t } = useTranslation('chat');

  // 触发 topics 加载
  useFetchTopics();

  const openingMessage = useAgentStore(agentSelectors.openingMessage);
  const openingQuestions = useAgentStore(agentSelectors.openingQuestions);
  const topics = useChatStore(topicSelectors.currentTopics);
  const topicsInit = useChatStore((s) => s.topicsInit);

  const meta = useSessionStore(sessionMetaSelectors.currentAgentMeta, isEqual);

  // 判断是否显示 topics 相关内容（加载中或有数据）
  const shouldShowTopicsSection = !topicsInit || (topics && topics.length > 0);

  const agentSystemRoleMsg = t('agentDefaultMessageWithSystemRole', {
    name: meta.title || t('defaultAgent'),
    systemRole: meta.description,
  });

  const agentMsg = t('agentDefaultMessageWithoutEdit', {
    name: meta.title || t('defaultAgent'),
  });

  const message = useMemo(() => {
    if (openingMessage) return openingMessage;
    return !!meta.description ? agentSystemRoleMsg : agentMsg;
  }, [openingMessage, agentSystemRoleMsg, agentMsg, meta.description]);

  const welcomeBubble = (
    <WelcomeChatBubble
      message={{
        content: message,
        createdAt: Date.now(),
        id: 'welcome',
        meta,
        role: 'assistant',
        updatedAt: Date.now(),
      }}
    />
  );

  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        gap: 16,
        justifyContent: 'flex-end',
        padding: 16,
        paddingBottom: 48,
      }}
      style={{ flex: 1, marginBottom: -24 }}
    >
      {welcomeBubble}
      {!topicsInit || typeof topics === 'undefined' ? (
        <RecentTopicsSkeleton />
      ) : shouldShowTopicsSection ? (
        <RecentTopics />
      ) : (
        openingQuestions.length > 0 && <OpeningQuestions questions={openingQuestions} />
      )}
    </ScrollView>
  );
};

export default WelcomeMessage;
