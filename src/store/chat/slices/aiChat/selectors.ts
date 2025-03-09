import type { ChatStoreState } from '../../initialState';

const isMessageInReasoning = (id: string) => (s: ChatStoreState) =>
  s.reasoningLoadingIds.includes(id);

const isMessageInSearchWorkflow = (id: string) => (s: ChatStoreState) =>
  s.searchWorkflowLoadingIds.includes(id);

const isIntentUnderstanding = (id: string) => (s: ChatStoreState) =>
  isMessageInSearchWorkflow(id)(s);

export const aiChatSelectors = {
  isIntentUnderstanding,
  isMessageInReasoning,
  isMessageInSearchWorkflow,
};
