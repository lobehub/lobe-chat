import type { ChatStoreState } from '../../../initialState';
import { getMessageByToolCallId, mainDisplayChatIDs } from './chat';

const isMessageEditing = (id: string) => (s: ChatStoreState) => s.messageEditingIds.includes(id);
const isMessageLoading = (id: string) => (s: ChatStoreState) => s.messageLoadingIds.includes(id);
const isMessageRegenerating = (id: string) => (s: ChatStoreState) => s.regeneratingIds.includes(id);

const isMessageGenerating = (id: string) => (s: ChatStoreState) => s.chatLoadingIds.includes(id);
const isMessageInRAGFlow = (id: string) => (s: ChatStoreState) =>
  s.messageRAGLoadingIds.includes(id);
const isMessageInChatReasoning = (id: string) => (s: ChatStoreState) =>
  s.reasoningLoadingIds.includes(id);

const isPluginApiInvoking = (id: string) => (s: ChatStoreState) =>
  s.pluginApiLoadingIds.includes(id);

const isToolCallStreaming = (id: string, index: number) => (s: ChatStoreState) => {
  const isLoading = s.toolCallingStreamIds[id];

  if (!isLoading) return false;

  return isLoading[index];
};

const isInToolsCalling = (id: string, index: number) => (s: ChatStoreState) => {
  const isStreamingToolsCalling = isToolCallStreaming(id, index)(s);

  const isInvokingPluginApi = s.messageInToolsCallingIds.includes(id);

  return isStreamingToolsCalling || isInvokingPluginApi;
};

const isToolApiNameShining =
  (messageId: string, index: number, toolCallId: string) => (s: ChatStoreState) => {
    const toolMessageId = getMessageByToolCallId(toolCallId)(s)?.id;
    const isStreaming = isToolCallStreaming(messageId, index)(s);
    const isPluginInvoking = !toolMessageId ? true : isPluginApiInvoking(toolMessageId)(s);

    return isStreaming || isPluginInvoking;
  };

const isAIGenerating = (s: ChatStoreState) =>
  s.chatLoadingIds.some((id) => mainDisplayChatIDs(s).includes(id));

const isInRAGFlow = (s: ChatStoreState) =>
  s.messageRAGLoadingIds.some((id) => mainDisplayChatIDs(s).includes(id));

const isCreatingMessage = (s: ChatStoreState) => s.isCreatingMessage;

const isHasMessageLoading = (s: ChatStoreState) =>
  s.messageLoadingIds.some((id) => mainDisplayChatIDs(s).includes(id));

/**
 * this function is used to determine whether the send button should be disabled
 */
const isSendButtonDisabledByMessage = (s: ChatStoreState) =>
  // 1. when there is message loading
  isHasMessageLoading(s) ||
  // 2. when is creating the topic
  s.creatingTopic ||
  // 3. when is creating the message
  isCreatingMessage(s) ||
  // 4. when the message is in RAG flow
  isInRAGFlow(s);

export const messageStateSelectors = {
  isAIGenerating,
  isCreatingMessage,
  isHasMessageLoading,
  isInRAGFlow,
  isInToolsCalling,
  isMessageEditing,
  isMessageGenerating,
  isMessageInChatReasoning,
  isMessageInRAGFlow,
  isMessageLoading,
  isMessageRegenerating,
  isPluginApiInvoking,
  isSendButtonDisabledByMessage,
  isToolApiNameShining,
  isToolCallStreaming,
};
