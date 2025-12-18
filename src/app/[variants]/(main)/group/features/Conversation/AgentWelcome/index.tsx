'use client';

import { Avatar, Markdown, Text } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import React, { memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DEFAULT_AVATAR, DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAgentStore } from '@/store/agent';
import { agentSelectors, builtinAgentSelectors } from '@/store/agent/selectors';
import { useAgentGroupStore } from '@/store/agentGroup';
import { agentGroupSelectors } from '@/store/agentGroup/selectors';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

import AddButton from './AddButton';
import OpeningQuestions from './OpeningQuestions';
import ToolAuthAlert from './ToolAuthAlert';

const InboxWelcome = memo(() => {
  const { t } = useTranslation(['welcome', 'chat']);
  const mobile = useIsMobile();
  const isInbox = useAgentStore(builtinAgentSelectors.isInboxAgent);
  const fontSize = useUserStore(userGeneralSettingsSelectors.fontSize);
  const meta = useAgentStore(agentSelectors.currentAgentMeta, isEqual);

  // Use group config for opening message and questions
  const groupOpeningMessage = useAgentGroupStore(agentGroupSelectors.currentGroupOpeningMessage);
  const groupOpeningQuestions = useAgentGroupStore(
    agentGroupSelectors.currentGroupOpeningQuestions,
    isEqual,
  );

  const agentSystemRoleMsg = t('agentDefaultMessageWithSystemRole', {
    name: meta.title || t('defaultAgent', { ns: 'chat' }),
    ns: 'chat',
  });

  // Get agent opening message and questions (always call hooks)
  const agentOpeningMessage = useAgentStore(agentSelectors.openingMessage);
  const agentOpeningQuestions = useAgentStore(agentSelectors.openingQuestions, isEqual);

  // Prefer group opening message/questions over agent's
  const openingMessage = groupOpeningMessage || agentOpeningMessage;
  const openingQuestions =
    groupOpeningQuestions.length > 0 ? groupOpeningQuestions : agentOpeningQuestions;

  const message = useMemo(() => {
    if (openingMessage) return openingMessage;
    return agentSystemRoleMsg;
  }, [openingMessage, agentSystemRoleMsg, meta.description]);

  const displayTitle = isInbox ? 'Lobe AI' : meta.title || t('defaultSession', { ns: 'common' });

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
        <Avatar
          avatar={isInbox ? DEFAULT_INBOX_AVATAR : meta.avatar || DEFAULT_AVATAR}
          background={meta.backgroundColor}
          shape={'square'}
          size={78}
        />
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
