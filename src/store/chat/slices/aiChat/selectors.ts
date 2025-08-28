import { messageMapKey } from '@/store/chat/utils/messageMapKey';

import type { ChatStoreState } from '../../initialState';

const isMessageInReasoning = (id: string) => (s: ChatStoreState) =>
  s.reasoningLoadingIds.includes(id);

const isMessageInSearchWorkflow = (id: string) => (s: ChatStoreState) =>
  s.searchWorkflowLoadingIds.includes(id);

const isIntentUnderstanding = (id: string) => (s: ChatStoreState) =>
  isMessageInSearchWorkflow(id)(s);

const isCurrentSendMessageLoading = (s: ChatStoreState) => {
  const operationKey = messageMapKey(s.activeId, s.activeTopicId);
  return s.mainSendMessageOperations[operationKey]?.isLoading || false;
};

const isCurrentSendMessageError = (s: ChatStoreState) => {
  const operationKey = messageMapKey(s.activeId, s.activeTopicId);
  return s.mainSendMessageOperations[operationKey]?.inputSendErrorMsg;
};

const isSendMessageLoadingForTopic = (topicKey: string) => (s: ChatStoreState) =>
  s.mainSendMessageOperations[topicKey]?.isLoading ?? false;

export const aiChatSelectors = {
  isCurrentSendMessageError,
  isCurrentSendMessageLoading,
  isIntentUnderstanding,
  isMessageInReasoning,
  isMessageInSearchWorkflow,
  isSendMessageLoadingForTopic,
};
