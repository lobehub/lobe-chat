'use client';

import { agentDisplayName } from '@lobechat/types';
import { Avatar, Flexbox, Text } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_INBOX_AVATAR } from '@/const/index';
import { conversationSelectors, useConversationStore } from '@/features/Conversation';
import SuggestQuestions from '@/features/SuggestQuestions';
import { useAgentStore } from '@/store/agent';
import { agentByIdSelectors, agentSelectors, builtinAgentSelectors } from '@/store/agent/selectors';

const AgentBuilderWelcome = memo(() => {
  const { t } = useTranslation('chat');
  const agentId = useConversationStore(conversationSelectors.agentId);
  const agent = useAgentStore(agentByIdSelectors.getAgentConfigById(agentId));
  const meta = useAgentStore(agentSelectors.getAgentMetaById(agentId));
  const inboxAgentId = useAgentStore(builtinAgentSelectors.inboxAgentId);
  // The copilot is whichever agent is selected — Lobe AI by default.
  const title =
    agentId === inboxAgentId ? t('inbox.title') : agentDisplayName(meta, t('untitledAgent'));

  return (
    <>
      <Flexbox flex={1} />
      <Flexbox
        gap={12}
        width={'100%'}
        style={{
          paddingBottom: 16,
        }}
      >
        <Avatar avatar={agent?.avatar || DEFAULT_INBOX_AVATAR} shape={'square'} size={78} />
        <Text fontSize={24} weight={'bold'}>
          {title}
        </Text>
        <SuggestQuestions count={3} mode="write" />
      </Flexbox>
    </>
  );
});

export default AgentBuilderWelcome;
