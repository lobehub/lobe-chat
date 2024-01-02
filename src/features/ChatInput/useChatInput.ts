import { TextAreaRef } from "antd/es/input/TextArea";
import { useCallback, useRef, useState } from "react";

import { useIsMobile } from "@/hooks/useIsMobile";
import { useChatStore } from "@/store/chat";
import { useGlobalStore } from "@/store/global";
import { useSessionStore } from "@/store/session";
import { agentSelectors } from "@/store/session/slices/agent";

import { useSendMessage } from "./useSend";

/**
 * 聊天消息输入框相关的状态和交互逻辑
 */
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
    inputHeight,
    loading,
    onInput,
    /**
     * 发送消息
     */
    onSend: handleSend,
    onStop,
    ref,
    setExpand,
    updatePreference,
    value,
  };
};
