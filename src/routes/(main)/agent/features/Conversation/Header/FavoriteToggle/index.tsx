'use client';

import { AGENT_CHAT_TOPIC_URL, AGENT_CHAT_URL } from '@lobechat/const';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentContext } from '@/features/Conversation/useAgentContext';
import { FavoriteButton, type FavoriteTarget } from '@/features/Favorites';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';

/**
 * Favorites the open topic, or the agent itself on its new-topic screen. Only
 * the sidebar Favorites are touched; the topic's own favorite flag (the topic
 * list's star filter) is a separate setting in the ⋯ menu.
 */
const FavoriteToggle = memo(() => {
  const { t } = useTranslation(['topic', 'chat']);
  const { agentId, topicId } = useAgentContext();
  const topicTitle = useChatStore((s) =>
    topicId ? topicSelectors.getTopicById(topicId)(s)?.title : undefined,
  );
  const agentMeta = useAgentStore((s) =>
    agentId ? agentSelectors.getAgentMetaById(agentId)(s) : undefined,
  );

  if (!agentId) return null;

  const target: FavoriteTarget = topicId
    ? {
        path: AGENT_CHAT_TOPIC_URL(agentId, topicId),
        targetId: topicId,
        title: topicTitle || t('newTopic'),
        type: 'topic',
      }
    : {
        icon: agentMeta?.avatar ?? null,
        path: AGENT_CHAT_URL(agentId),
        targetId: agentId,
        title: agentMeta?.title || t('untitledAgent', { ns: 'chat' }),
        type: 'agent',
      };

  return <FavoriteButton {...target} />;
});

FavoriteToggle.displayName = 'FavoriteToggle';

export default FavoriteToggle;
