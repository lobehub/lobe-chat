import { memo } from 'react';

import InputArea from '@/features/ChatInput/Desktop/InputArea';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import { useSendThreadMessage } from './useSend';

const TextArea = memo<{ onSend?: () => void }>(({ onSend }) => {
  const [loading, value, updateInputMessage] = useChatStore((s) => [
    chatSelectors.isAIGenerating(s),
    s.threadInputMessage,
    s.updateThreadInputMessage,
  ]);
  const { send: sendMessage } = useSendThreadMessage();

  return (
    <InputArea
      loading={loading}
      onChange={updateInputMessage}
      onSend={() => {
        sendMessage();
        onSend?.();
      }}
      value={value}
    />
  );
});

export default TextArea;
