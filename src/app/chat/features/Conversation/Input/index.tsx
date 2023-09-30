import { ChatInputArea } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import dynamic from 'next/dynamic';
import { Suspense, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CHAT_TEXTAREA_HEIGHT } from '@/const/layoutTokens';
import { useSessionStore } from '@/store/session';

import ActionLeft from './ActionBar/ActionLeft';
import ActionsRight from './ActionBar/ActionRight';
import Desktop from './Desktop';
import Footer from './Footer';
import Mobile from './Mobile';

const Token = dynamic(() => import('./ActionBar/Token'), { ssr: false });

const ChatInput = () => {
  const { t } = useTranslation('common');
  const [expand, setExpand] = useState<boolean>(false);
  const [message, setMessage] = useState('');
  const { mobile } = useResponsive();

  const [isLoading, sendMessage, stopGenerateMessage] = useSessionStore((s) => [
    !!s.chatLoadingId,
    s.sendMessage,
    s.stopGenerateMessage,
  ]);

  const Render = mobile ? Mobile : Desktop;

  return (
    <Render expand={expand}>
      <ChatInputArea
        actions={
          <>
            <ActionLeft />
            <Suspense>
              <Token input={message} />
            </Suspense>
          </>
        }
        actionsRight={<ActionsRight />}
        expand={expand}
        footer={<Footer />}
        loading={isLoading}
        minHeight={mobile ? 0 : CHAT_TEXTAREA_HEIGHT}
        onExpandChange={setExpand}
        onInputChange={setMessage}
        onSend={sendMessage}
        onStop={stopGenerateMessage}
        placeholder={t('sendPlaceholder')}
        text={{
          send: t('send'),
          stop: t('stop'),
        }}
        value={message}
      />
    </Render>
  );
};

export default memo(ChatInput);
