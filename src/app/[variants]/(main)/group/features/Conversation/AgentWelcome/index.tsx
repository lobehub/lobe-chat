'use client';

import { Markdown, Text } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import React, { memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SupervisorAvatar from '@/app/[variants]/(main)/group/features/GroupAvatar';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAgentStore } from '@/store/agent';
import { agentSelectors, builtinAgentSelectors } from '@/store/agent/selectors';
import { agentGroupSelectors, useAgentGroupStore } from '@/store/agentGroup';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

import AddButton from './AddButton';
import OpeningQuestions from './OpeningQuestions';
import ToolAuthAlert from './ToolAuthAlert';

const InboxWelcome = memo(() => {
  const { t } = useTranslation(['welcome', 'chat']);
  const mobile = useIsMobile();
  const isInbox = useAgentStore(builtinAgentSelectors.isInboxAgent);
  const openingQuestions = useAgentStore(agentSelectors.openingQuestions, isEqual);
  const fontSize = useUserStore(userGeneralSettingsSelectors.fontSize);
  const meta = useAgentStore(agentSelectors.currentAgentMeta, isEqual);
  const [groupMeta] = useAgentGroupStore((s) => [agentGroupSelectors.currentGroupMeta(s)]);

  const agentSystemRoleMsg = t('agentDefaultMessageWithSystemRole', {
    name: meta.title || t('defaultAgent', { ns: 'chat' }),
    ns: 'chat',
  });
  const openingMessage = useAgentStore(agentSelectors.openingMessage);

  const message = useMemo(() => {
    if (openingMessage) return openingMessage;
    return agentSystemRoleMsg;
  }, [openingMessage, agentSystemRoleMsg, meta.description]);

  const displayTitle = groupMeta.title;

  return (
    <>
      <Flexbox flex={1} />
      <Flexbox
        gap={12}
        style={{
          paddingBottom: 'max(10vh, 32px)',
        }}
        width={'100%'}
      >
        <SupervisorAvatar size={78} />
        <Text fontSize={32} weight={'bold'}>
          {displayTitle}
        </Text>
        <Flexbox width={'min(100%, 640px)'}>
          <Markdown
            customRender={(dom, context) => {
              if (context.text.includes('<plus />')) {
                return (
                  <Trans
                    components={{
                      br: <br />,
                      plus: <AddButton />,
                    }}
                    i18nKey="guide.defaultMessage"
                    ns="welcome"
                    values={{ appName: 'Lobe AI' }}
                  />
                );
              }
              return dom;
            }}
            fontSize={fontSize}
            variant={'chat'}
          >
            {isInbox ? t('guide.defaultMessage', { appName: 'Lobe AI' }) : message}
          </Markdown>
        </Flexbox>
        {openingQuestions.length > 0 && (
          <OpeningQuestions mobile={mobile} questions={openingQuestions} />
        )}
        <ToolAuthAlert />
      </Flexbox>
    </>
  );
});

export default InboxWelcome;
