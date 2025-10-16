'use client';

import { BRANDING_NAME } from '@lobechat/const';
import { FluentEmoji, Markdown } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import React, { memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useGreeting } from '@/hooks/useGreeting';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

import AddButton from './AddButton';
import OpeningQuestions from './OpeningQuestions';

const useStyles = createStyles(({ css, responsive }) => ({
  container: css`
    align-items: center;
    ${responsive.mobile} {
      align-items: flex-start;
    }
  `,
  desc: css`
    font-size: 14px;
    text-align: center;
    ${responsive.mobile} {
      text-align: start;
    }
  `,
  title: css`
    margin-block: 0.2em 0;
    font-size: 32px;
    font-weight: bolder;
    line-height: 1;
    ${responsive.mobile} {
      font-size: 24px;
    }
  `,
}));

const InboxWelcome = memo(() => {
  const { t } = useTranslation(['welcome', 'chat']);
  const { styles } = useStyles();
  const mobile = useIsMobile();
  const greeting = useGreeting();
  const { showCreateSession } = useServerConfigStore(featureFlagsSelectors);
  const openingQuestions = useAgentStore(agentSelectors.openingQuestions);

  const meta = useSessionStore(sessionMetaSelectors.currentAgentMeta, isEqual);

  const agentSystemRoleMsg = t('agentDefaultMessageWithSystemRole', {
    name: meta.title || t('defaultAgent', { ns: 'chat' }),
    ns: 'chat',
  });
  const openingMessage = useAgentStore(agentSelectors.openingMessage);

  const showInboxWelcome = useChatStore(chatSelectors.showInboxWelcome);

  const message = useMemo(() => {
    if (openingMessage) return openingMessage;
    return agentSystemRoleMsg;
  }, [openingMessage, agentSystemRoleMsg, meta.description]);

  return (
    <Center gap={12} padding={16} width={'100%'}>
      <Flexbox className={styles.container} gap={16} style={{ maxWidth: 800 }} width={'100%'}>
        <Flexbox align={'center'} gap={8} horizontal>
          <FluentEmoji emoji={'👋'} size={40} type={'anim'} />
          <h1 className={styles.title}>{greeting}</h1>
        </Flexbox>
        <Markdown
          className={styles.desc}
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
                  values={{ appName: BRANDING_NAME }}
                />
              );
            }
            return dom;
          }}
          variant={'chat'}
        >
          {showInboxWelcome
            ? t(showCreateSession ? 'guide.defaultMessage' : 'guide.defaultMessageWithoutCreate', {
                appName: BRANDING_NAME,
              })
            : message}
        </Markdown>
        {openingQuestions.length > 0 && (
          <OpeningQuestions mobile={mobile} questions={openingQuestions} />
        )}
      </Flexbox>
    </Center>
  );
});

export default InboxWelcome;
