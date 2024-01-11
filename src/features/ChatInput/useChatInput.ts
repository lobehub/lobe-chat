import { TextAreaRef } from 'antd/es/input/TextArea';
import { useCallback, useRef, useState } from 'react';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

import { useSendMessage } from './useSend';

export const useChatInput = () => {
  const ref = useRef<TextAreaRef>(null);
  const [expand, setExpand] = useState<boolean>(false);
  const onSend = useSendMessage();

  const canUpload = useSessionStore(agentSelectors.modelHasVisionAbility);
  const [loading, value, onInput, onStop] = useChatStore((s) => [
    !!s.chatLoadingId,
    s.inputMessage,
    s.updateInputMessage,
    s.stopGenerateMessage,
  ]);
  const mobile = useIsMobile();

  const handleSend = useCallback(() => {
    setExpand(false);
    if (mobile) {
      ref?.current?.blur();
    }
    onSend();
  }, [onSend, mobile]);

  return {
    canUpload,
    expand,
    loading,
    onInput,
    onSend: handleSend,
    onStop,
    ref,
    setExpand,
    value,
  };
};
