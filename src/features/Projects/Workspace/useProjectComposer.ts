import { useState } from 'react';

import { taskDetailPath } from '@/features/AgentTasks/shared/taskDetailPath';
import type { SendButtonHandler } from '@/features/ChatInput/store/initialState';
import { appendTaskAttachments } from '@/features/Home/InputArea/taskAttachments';
import { taskNameFromMessage } from '@/features/Home/InputArea/taskName';
import { getProjectConversationPath } from '@/features/Projects/Layout/navigation';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { agentService } from '@/services/agent';
import { useAgentStore } from '@/store/agent';
import { useChatStore } from '@/store/chat';
import { fileChatSelectors, useFileStore } from '@/store/file';
import type { ProjectDetail } from '@/store/project';
import { useProjectDirectoryStore } from '@/store/projectWorkingDirectory';
import { useTaskStore } from '@/store/task';

/**
 * `chat` hands the message to the project's main agent in a new project
 * conversation. `task` records it as a task straight away, without a model
 * round trip.
 */
export type ProjectComposerMode = 'chat' | 'task';

const TITLE_LENGTH = 50;

/** A conversation is titled by its first line until the agent renames it. */
export const toConversationTitle = (message: string) => {
  const firstLine = message.trim().split('\n')[0].trim();
  return firstLine.length > TITLE_LENGTH ? `${firstLine.slice(0, TITLE_LENGTH)}…` : firstLine;
};

/** `sendMessage` reads the agent's model from `agentMap`; hydrate it first. */
const ensureAgentConfigLoaded = async (agentId: string) => {
  const agentState = useAgentStore.getState();
  if (agentState.agentMap[agentId]) return;
  const config = await agentService.getAgentConfigById(agentId);
  if (config) agentState.internal_dispatchAgentMap(agentId, config);
};

export class AttachmentsNotReadyError extends Error {
  constructor() {
    super('Attachments are still uploading');
    this.name = 'AttachmentsNotReadyError';
  }
}

export const useProjectComposer = (
  project: ProjectDetail['project'],
  mode: ProjectComposerMode,
) => {
  const navigate = useWorkspaceAwareNavigate();
  const createProjectTopic = useProjectDirectoryStore((s) => s.createProjectTopic);
  const createTask = useTaskStore((s) => s.createTask);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const clearChatUploadFileList = useFileStore((s) => s.clearChatUploadFileList);
  const [sending, setSending] = useState(false);

  /** Rejects when nothing left the composer, so the caller can report it. */
  const send: SendButtonHandler = async ({ clearContent, getEditorData, getMarkdownContent }) => {
    const message = getMarkdownContent().trim();
    const files = fileChatSelectors.chatUploadFileList(useFileStore.getState());
    if ((!message && files.length === 0) || sending) return;
    if (files.some((file) => file.status !== 'success' || !file.fileUrl))
      throw new AttachmentsNotReadyError();

    const agentId = project.coordinatorAgentId;
    const editorData = getEditorData();
    const title = toConversationTitle(message || files[0].file.name);

    setSending(true);
    try {
      if (mode === 'task') {
        const task = await createTask({
          assigneeAgentId: agentId,
          editorData: appendTaskAttachments(editorData, message, files),
          instruction: message || title,
          name: taskNameFromMessage(message || title),
          projectId: project.id,
        });
        clearContent();
        clearChatUploadFileList(files.map((file) => file.id));
        if (task) navigate(taskDetailPath(task.id, undefined, task.name));
        return;
      }

      // The conversation is created inside the project first, so the project
      // owns it from the start, and the message is sent into that exact topic.
      // Sending here rather than after the page loads keeps the attachments,
      // which cannot travel through the URL.
      const [topic] = await Promise.all([
        createProjectTopic({ agentId, projectId: project.id, title }),
        ensureAgentConfigLoaded(agentId),
      ]);
      void sendMessage({
        context: { agentId, topicId: topic.id },
        editorData,
        files,
        // This composer is gone once the conversation opens; a failed send is
        // shown on the message there instead of restored into this editor.
        inputEditor: null,
        message,
      });
      clearContent();
      clearChatUploadFileList();
      navigate(getProjectConversationPath(project.slug ?? project.id, topic.id));
    } finally {
      setSending(false);
    }
  };

  return { send, sending };
};
