import { useActiveWorkspaceId } from '@/business/client/hooks/useActiveWorkspaceId';
import { useAgentConversationCoordinate } from '@/features/Conversation/useAgentConversationCoordinate';
import { useAgentStore } from '@/store/agent';
import { agentByIdSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';

/**
 * The current topic when it can carry comments, otherwise `undefined`.
 * Comments need a workspace, and a workspace-private agent's topics are
 * visible only to their creator, so there is nobody else to comment with.
 * Group conversations are left alone: their active agent is the group's
 * supervisor (or unresolved), not the conversation's owner.
 */
export const useCommentableTopicId = (): string | undefined => {
  const workspaceId = useActiveWorkspaceId();
  const [agentId, topicId] = useAgentConversationCoordinate();
  const isGroupConversation = useChatStore((s) => !!s.activeGroupId);
  const isPrivateAgent = useAgentStore(
    (s) =>
      !isGroupConversation && agentByIdSelectors.getAgentById(agentId)(s)?.visibility === 'private',
  );

  if (!workspaceId || isPrivateAgent || !topicId) return undefined;

  return topicId;
};
