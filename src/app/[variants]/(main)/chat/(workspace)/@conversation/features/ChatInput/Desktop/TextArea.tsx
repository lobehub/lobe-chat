import { memo } from 'react';

import InputArea from '@/features/ChatInput/Desktop/InputArea';
import { useSendGroupMessage, useSendMessage } from '@/features/ChatInput/useSend';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/slices/message/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

interface TextAreaProps {
  onSend?: () => void;
  targetMemberId?: string;
}

const TextArea = memo<TextAreaProps>(({ onSend, targetMemberId }) => {
  const [loading, value, updateInputMessage] = useChatStore((s) => [
    chatSelectors.isAIGenerating(s),
    s.inputMessage,
    s.updateInputMessage,
  ]);

  const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);

  const { send: sendMessage } = useSendMessage();
  const { send: sendGroupMessage } = useSendGroupMessage();

  return (
    <InputArea
      loading={loading}
      onChange={updateInputMessage}
      onSend={() => {
        if (isGroupSession) {
          sendGroupMessage({ targetMemberId });
        } else {
          sendMessage();
        }

        onSend?.();
      }}
      value={value}
    />
  );
});

export default TextArea;
