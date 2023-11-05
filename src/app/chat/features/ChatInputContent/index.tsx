import { ChatInputArea } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import dynamic from 'next/dynamic';
import { ReactNode, Suspense, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CHAT_TEXTAREA_HEIGHT } from '@/const/layoutTokens';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

import ActionLeft from './ActionBar/ActionLeft';
import ActionsRight from './ActionBar/ActionRight';

const Token = dynamic(() => import('./ActionBar/Token'), { ssr: false });

interface ChatContentProps {
  expand?: boolean;
  footer?: ReactNode;
  mobile?: boolean;
  onExpandChange?: (expand: boolean) => void;
}

const ChatInputContent = memo<ChatContentProps>(
  ({ expand, onExpandChange, mobile: defaultMobile, footer }) => {
    const { t } = useTranslation('common');

    const [message, setMessage] = useState('');
    const { mobile: runtimeMobile } = useResponsive();

    const mobile = runtimeMobile || defaultMobile;

    const [isLoading, sendMessage, stopGenerateMessage, showTokenTag] = useSessionStore((s) => [
      !!s.chatLoadingId,
      s.sendMessage,
      s.stopGenerateMessage,
      agentSelectors.showTokenTag(s),
    ]);

    return (
      <ChatInputArea
        actions={
          <>
            <ActionLeft />
            {showTokenTag && (
              <Suspense>
                <Token input={message} />
              </Suspense>
            )}
          </>
        }
        actionsRight={<ActionsRight />}
        expand={expand}
        footer={footer}
        loading={isLoading}
        minHeight={mobile ? 0 : CHAT_TEXTAREA_HEIGHT}
        onExpandChange={onExpandChange}
        onInputChange={setMessage}
        onSend={sendMessage}
        onStop={stopGenerateMessage}
        placeholder={t('sendPlaceholder', { ns: 'chat' })}
        text={{
          send: t('send'),
          stop: t('stop'),
        }}
        value={message}
      />
    );
  },
);

export default ChatInputContent;
