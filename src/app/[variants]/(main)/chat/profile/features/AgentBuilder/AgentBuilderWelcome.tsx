'use client';

import { DEFAULT_INBOX_AVATAR } from '@lobechat/const';
import { Avatar, Markdown } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const AgentBuilderWelcome = memo(() => {
  const { t } = useTranslation('chat');

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
        <Avatar avatar={DEFAULT_INBOX_AVATAR} shape={'square'} size={78} />
        <Markdown fontSize={14} variant={'chat'}>
          {t('agentBuilder.welcome')}
        </Markdown>
      </Flexbox>
    </>
  );
});

export default AgentBuilderWelcome;
