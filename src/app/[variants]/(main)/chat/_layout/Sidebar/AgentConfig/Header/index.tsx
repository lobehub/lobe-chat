'use client';

import { Text } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import Avatar from './Avatar';

const HeaderInfo = memo(() => {
  const { t } = useTranslation(['chat', 'hotkey']);
  const isInbox = useSessionStore(sessionSelectors.isInboxSession);
  const title = useAgentStore(agentSelectors.currentAgentTitle);

  const displayTitle = isInbox ? t('inbox.title') : title;

  return (
    <Flexbox
      align={'center'}
      flex={1}
      gap={8}
      horizontal
      style={{
        overflow: 'hidden',
      }}
    >
      <Avatar />
      <Text ellipsis weight={500}>
        {displayTitle}
      </Text>
    </Flexbox>
  );
});

export default HeaderInfo;
