'use client';

import { GROUP_CHAT_TOPIC_URL, GROUP_CHAT_URL } from '@lobechat/const';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FavoriteButton, type FavoriteTarget } from '@/features/Favorites';
import { useAgentGroupStore } from '@/store/agentGroup';
import { agentGroupSelectors } from '@/store/agentGroup/selectors';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';

import { useGroupContext } from '../../useGroupContext';

/** Favorites the open group topic, or the group itself before its first topic. */
const FavoriteToggle = memo(() => {
  const { t } = useTranslation(['topic', 'chat']);
  const { groupId, topicId } = useGroupContext();
  const topicTitle = useChatStore((s) =>
    topicId ? topicSelectors.getTopicById(topicId)(s)?.title : undefined,
  );
  const groupMeta = useAgentGroupStore((s) =>
    groupId ? agentGroupSelectors.getGroupMeta(groupId)(s) : undefined,
  );

  if (!groupId) return null;

  const target: FavoriteTarget = topicId
    ? {
        path: GROUP_CHAT_TOPIC_URL(groupId, topicId),
        targetId: topicId,
        title: topicTitle || t('newTopic'),
        type: 'topic',
      }
    : {
        icon: groupMeta?.avatar ?? null,
        path: GROUP_CHAT_URL(groupId),
        targetId: groupId,
        title: groupMeta?.title || t('untitledGroup', { ns: 'chat' }),
        type: 'group',
      };

  return <FavoriteButton {...target} />;
});

FavoriteToggle.displayName = 'FavoriteToggle';

export default FavoriteToggle;
