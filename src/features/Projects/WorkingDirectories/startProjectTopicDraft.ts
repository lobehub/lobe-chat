import { useChatStore } from '@/store/chat';

import { getProjectConversationPath } from '../Layout/navigation';

/**
 * Open a blank project conversation on one directory, the same habit as an
 * agent's "+": no topic row is created here. The staged directory pins the
 * agent and device for the composer, and the first message creates the topic
 * inside it (see `pendingNewTopicDirectory`).
 */
export const startProjectTopicDraft = ({
  agentId,
  directoryId,
  navigate,
  projectId,
}: {
  agentId: string;
  directoryId: string;
  navigate: (path: string) => void;
  projectId: string;
}) => {
  const chat = useChatStore.getState();
  chat.switchTopic(null, { skipRefreshMessage: true });
  chat.setPendingNewTopicDirectory({ agentId, projectWorkingDirectoryId: directoryId });
  navigate(getProjectConversationPath(projectId));
};
