import { useCallback, useMemo } from 'react';

import { useChatStore } from '@/store/chat';
import { threadSelectors } from '@/store/chat/selectors';
import { SendMessageParams } from '@/types/message';

export type UseSendMessageParams = Pick<
  SendMessageParams,
  'onlyAddUserMessage' | 'isWelcomeQuestion'
>;

export const useSendThreadMessage = () => {
  const [sendMessage, updateInputMessage] = useChatStore((s) => [
    s.sendThreadMessage,
    s.updateThreadInputMessage,
  ]);

  const isSendButtonDisabledByMessage = useChatStore(threadSelectors.isSendButtonDisabledByMessage);

  const canSend = !isSendButtonDisabledByMessage;

  const send = useCallback((params: UseSendMessageParams = {}) => {
    const store = useChatStore.getState();
    if (threadSelectors.isThreadAIGenerating(store)) return;

    const isSendButtonDisabledByMessage = threadSelectors.isSendButtonDisabledByMessage(
      useChatStore.getState(),
    );

    const canSend = !isSendButtonDisabledByMessage;
    if (!canSend) return;

    // if there is no message and no image, then we should not send the message
    if (!store.threadInputMessage) return;

    sendMessage({ message: store.threadInputMessage, ...params });

    updateInputMessage('');

    // const hasSystemRole = agentSelectors.hasSystemRole(useAgentStore.getState());
    // const agentSetting = useAgentStore.getState().agentSettingInstance;

    // // if there is a system role, then we need to use agent setting instance to autocomplete agent meta
    // if (hasSystemRole && !!agentSetting) {
    //   agentSetting.autocompleteAllMeta();
    // }
  }, []);

  return useMemo(() => ({ canSend, send }), [canSend]);
};
