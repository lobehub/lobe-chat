import { TextAreaRef } from 'antd/es/input/TextArea';
import { useCallback, useRef, useState } from 'react';

import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/slices/agent';

import { useSendMessage } from './useSend';

export const useChatInput = () => {
  const ref = useRef<TextAreaRef>(null);
  const [expand, setExpand] = useState<boolean>(false);
  const onSend = useSendMessage();
  const [inputHeight, updatePreference] = useGlobalStore((s) => [
    s.preference.inputHeight,
    s.updatePreference,
  ]);
  const canUpload = useSessionStore(agentSelectors.modelHasVisionAbility);
  const [loading, value, onInput, onStop] = useChatStore((s) => [
    !!s.chatLoadingId,
    s.inputMessage,
    s.updateInputMessage,
    s.stopGenerateMessage,
  ]);

  const handleSend = useCallback(() => {
    setExpand(false);
    ref?.current?.blur();
    onSend();
  }, [onSend]);

  return {
    canUpload,
    expand,
    inputHeight,
    loading,
    onInput,
    onSend: handleSend,
    onStop,
    ref,
    setExpand,
    updatePreference,
    value,
  };
};
