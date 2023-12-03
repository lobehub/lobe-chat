import { Input, TextArea } from '@lobehub/ui';
import { memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';

import { useSendMessage } from '../useSend';

export interface InputAreaInnerProps {
  className?: string;
  mobile?: boolean;
}

const InputAreaInner = memo<InputAreaInnerProps>(({ className, mobile }) => {
  const { t } = useTranslation('chat');
  const isChineseInput = useRef(false);

  const [loading, message, updateInputMessage] = useChatStore((s) => [
    !!s.chatLoadingId,
    s.inputMessage,
    s.updateInputMessage,
  ]);

  const handleSend = useSendMessage();

  const Render = mobile ? Input : TextArea;

  return (
    <Render
      className={className}
      onBlur={(e) => {
        updateInputMessage(e.target.value);
      }}
      onChange={(e) => {
        updateInputMessage(e.target.value);
      }}
      onCompositionEnd={() => {
        isChineseInput.current = false;
      }}
      onCompositionStart={() => {
        isChineseInput.current = true;
      }}
      onPressEnter={(e) => {
        if (!loading && !e.shiftKey && !isChineseInput.current) {
          e.preventDefault();
          handleSend();
        }
      }}
      placeholder={t('sendPlaceholder')}
      resize={false}
      type={mobile ? 'block' : 'pure'}
      value={message}
    />
  );
});

export default InputAreaInner;
