export interface UrlMessageGateInput {
  /** Agent the conversation store is bound to. */
  agentId?: string;
  /** Topic the conversation store is bound to (`undefined` = a new conversation). */
  contextTopicId?: string | null;
  isAccessLoading: boolean;
  isAgentConfigLoading: boolean;
  messagesInit: boolean;
  /** `:aid` from an `/agent/:aid` URL. */
  routeAgentId?: string;
  /** `:topicId` from the route, when the URL names a topic. */
  routeTopicId?: string;
}

/**
 * Whether a `?message=` send can be consumed now. A URL that names a topic — a
 * project conversation created before its first message, or a topic link —
 * must send into that topic: until the conversation context has switched to
 * it, a send would start a new topic outside the project.
 */
export const isReadyToSendUrlMessage = ({
  agentId,
  contextTopicId,
  isAccessLoading,
  isAgentConfigLoading,
  messagesInit,
  routeAgentId,
  routeTopicId,
}: UrlMessageGateInput): boolean => {
  if (!agentId) return false;
  // During agent switching the URL can update before the conversation context.
  if (routeAgentId && routeAgentId !== agentId) return false;
  if (routeTopicId && contextTopicId !== routeTopicId) return false;

  // An existing conversation must finish loading its messages first, so the
  // send never lands during the skeleton fetch.
  const isNewConversation = !contextTopicId;
  if (isAgentConfigLoading || !(isNewConversation || messagesInit)) return false;

  return !isAccessLoading;
};
