import isEqual from 'fast-deep-equal';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { Flexbox } from '@/components';
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
  const ref = useRef<ScrollView>(null);

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

  const isLoaded = topicsInit && typeof topics !== 'undefined';

  // 首次加载和 isLoaded 后滚动到底部
  useEffect(() => {
    const scrollToBottom = () => {
      if (ref.current) {
        ref.current.scrollToEnd({ animated: true });
      }
    };

    // 使用 setTimeout 确保内容已渲染
    const timer = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timer);
  }, [isLoaded]);

  return (
    <ScrollView
      contentContainerStyle={{
        gap: 16,
        justifyContent: 'flex-end',
        minHeight: '100%',
        padding: 16,
        paddingBottom: 8,
      }}
      ref={ref}
      showsVerticalScrollIndicator={false}
      style={{ marginBottom: -24 }}
    >
      {welcomeBubble}
      {!isLoaded ? (
        <RecentTopicsSkeleton />
      ) : shouldShowTopicsSection ? (
        <RecentTopics />
      ) : (
        openingQuestions.length > 0 && <OpeningQuestions questions={openingQuestions} />
      )}
      <Flexbox style={{ height: 48 }} />
    </ScrollView>
  );
};

export default WelcomeMessage;
