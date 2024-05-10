import { TextAreaRef } from 'antd/es/input/TextArea';
import { useCallback, useRef, useState } from 'react';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

import { useSendMessage } from './useSend';

export const useChatInput = () => {
  const ref = useRef<TextAreaRef>(null);
  const [expand, setExpand] = useState<boolean>(false);
  const onSend = useSendMessage();

  const model = useAgentStore(agentSelectors.currentAgentModel);
  const canUpload = useUserStore(modelProviderSelectors.isModelEnabledUpload(model));

  const [loading, value, onInput, onStop] = useChatStore((s) => [
    chatSelectors.isAIGenerating(s),
    s.inputMessage,
    s.updateInputMessage,
    s.stopGenerateMessage,
  ]);

  const handleSend = useCallback(() => {
    setExpand(false);

    onSend();
  }, [onSend]);

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
