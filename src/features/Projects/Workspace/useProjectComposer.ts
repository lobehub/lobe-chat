import { useState } from 'react';

import { taskDetailPath } from '@/features/AgentTasks/shared/taskDetailPath';
import { getProjectConversationStartPath } from '@/features/Projects/Layout/navigation';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import type { ProjectDetail } from '@/store/project';
import { useProjectDirectoryStore } from '@/store/projectWorkingDirectory';
import { useTaskStore } from '@/store/task';

/**
 * `chat` hands the message to the project coordinator, which decides whether
 * to answer or to break it into project tasks. `task` records it as a task
 * straight away, without a model round trip.
 */
export type ProjectComposerMode = 'chat' | 'task';

const TITLE_LENGTH = 50;

/** A conversation is titled by its first line until the agent renames it. */
export const toConversationTitle = (message: string) => {
  const firstLine = message.trim().split('\n')[0].trim();
  return firstLine.length > TITLE_LENGTH ? `${firstLine.slice(0, TITLE_LENGTH)}…` : firstLine;
};

export const useProjectComposer = (project: ProjectDetail['project']) => {
  const navigate = useWorkspaceAwareNavigate();
  const createProjectTopic = useProjectDirectoryStore((s) => s.createProjectTopic);
  const createTask = useTaskStore((s) => s.createTask);
  const [sending, setSending] = useState(false);

  /** Resolves `true` once the message has left the composer. */
  const send = async (mode: ProjectComposerMode, content: string) => {
    const message = content.trim();
    if (!message || sending) return false;

    setSending(true);
    try {
      if (mode === 'task') {
        const task = await createTask({
          assigneeAgentId: project.coordinatorAgentId,
          instruction: message,
          projectId: project.id,
        });
        if (task) navigate(taskDetailPath(task.id, undefined, task.name));
        return true;
      }

      // The conversation exists before the first message so the project owns it
      // from the start; the message is sent once the conversation has loaded.
      const topic = await createProjectTopic({
        agentId: project.coordinatorAgentId,
        projectId: project.id,
        title: toConversationTitle(message),
      });
      navigate(getProjectConversationStartPath(project.slug ?? project.id, topic.id, message));
      return true;
    } finally {
      setSending(false);
    }
  };

  return { send, sending };
};
