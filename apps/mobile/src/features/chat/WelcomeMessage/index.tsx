import { Flexbox } from '@lobehub/ui-rn';
import isEqual from 'fast-deep-equal';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

import WelcomeChatBubble from '../ChatBubble/Welcome';
import OpeningQuestions from './OpeningQuestions';

const WelcomeMessage = () => {
  const { t } = useTranslation('chat');

  // 触发agent配置加载，获取loading状态
  // const { isLoading: isAgentLoading } = useInitAgentConfig();

  const openingMessage = useAgentStore(agentSelectors.openingMessage);
  const openingQuestions = useAgentStore(agentSelectors.openingQuestions);

  const meta = useSessionStore(sessionMetaSelectors.currentAgentMeta, isEqual);

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

  return openingQuestions.length > 0 ? (
    <Flexbox gap={16}>
      {welcomeBubble}
      <OpeningQuestions questions={openingQuestions} />
    </Flexbox>
  ) : (
    welcomeBubble
  );
};

export default WelcomeMessage;
