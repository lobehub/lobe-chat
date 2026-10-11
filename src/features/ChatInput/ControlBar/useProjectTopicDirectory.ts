import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import {
  type ProjectDirectory,
  useProjectDirectories,
  useProjectDirectoryStore,
} from '@/store/projectWorkingDirectory';

const EMPTY: ProjectDirectory[] = [];

/**
 * The open conversation's id when it runs in a project directory, otherwise
 * undefined. Such a conversation only chooses among its project's devices and
 * shows its directory read-only, so the control bars branch on this.
 */
export const useActiveProjectDirectoryTopicId = (): string | undefined =>
  useChatStore((s) =>
    s.activeTopicId && topicSelectors.getTopicById(s.activeTopicId)(s)?.projectWorkingDirectoryId
      ? s.activeTopicId
      : undefined,
  );

/**
 * The project directory a conversation runs in, and the project's other
 * directories it may move to. Empty for conversations outside a project
 * directory — those keep the general execution-target and directory pickers.
 */
export const useProjectTopicDirectory = (topicId?: string | null) => {
  const directoryId = useChatStore((s) =>
    topicId
      ? (topicSelectors.getTopicById(topicId)(s)?.projectWorkingDirectoryId ?? undefined)
      : undefined,
  );
  const projectId = useChatStore((s) =>
    topicId && directoryId
      ? (topicSelectors.getTopicById(topicId)(s)?.projectId ?? undefined)
      : undefined,
  );
  useProjectDirectoryStore((s) => s.useFetchDirectories)(projectId, !!projectId);
  // Without a project this would read the scope-wide list, so pin it empty.
  const rows = useProjectDirectories(projectId);
  const directories = projectId ? rows : EMPTY;

  return {
    directories,
    directory: directories.find((d) => d.id === directoryId),
    directoryId,
    projectId,
  };
};
