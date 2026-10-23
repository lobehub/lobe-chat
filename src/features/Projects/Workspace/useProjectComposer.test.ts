/**
 * @vitest-environment happy-dom
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProjectDetail } from '@/store/project';

import {
  AttachmentsNotReadyError,
  toConversationTitle,
  useProjectComposer,
} from './useProjectComposer';

const mocks = vi.hoisted(() => ({
  agentMap: {} as Record<string, unknown>,
  clearChatUploadFileList: vi.fn(),
  createProjectTopic: vi.fn(),
  createTask: vi.fn(),
  fileList: [] as unknown[],
  getAgentConfigById: vi.fn(),
  internal_dispatchAgentMap: vi.fn(),
  navigate: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock('@/features/Workspace/useWorkspaceAwareNavigate', () => ({
  useWorkspaceAwareNavigate: () => mocks.navigate,
}));

vi.mock('@/store/projectWorkingDirectory', () => ({
  useProjectDirectoryStore: (selector: (state: unknown) => unknown) =>
    selector({ createProjectTopic: mocks.createProjectTopic }),
}));

vi.mock('@/store/task', () => ({
  useTaskStore: (selector: (state: unknown) => unknown) =>
    selector({ createTask: mocks.createTask }),
}));

vi.mock('@/store/chat', () => ({
  useChatStore: (selector: (state: unknown) => unknown) =>
    selector({ sendMessage: mocks.sendMessage }),
}));

vi.mock('@/store/file', () => {
  const state = () => ({
    chatUploadFileList: mocks.fileList,
    clearChatUploadFileList: mocks.clearChatUploadFileList,
  });
  const useFileStore = Object.assign((selector: (s: unknown) => unknown) => selector(state()), {
    getState: state,
  });
  return {
    fileChatSelectors: {
      chatUploadFileList: (s: { chatUploadFileList: unknown[] }) => s.chatUploadFileList,
    },
    useFileStore,
  };
});

vi.mock('@/store/agent', () => ({
  useAgentStore: {
    getState: () => ({
      agentMap: mocks.agentMap,
      internal_dispatchAgentMap: mocks.internal_dispatchAgentMap,
    }),
  },
}));

vi.mock('@/services/agent', () => ({
  agentService: { getAgentConfigById: mocks.getAgentConfigById },
}));

const project = {
  coordinatorAgentId: 'coordinator',
  id: 'prj_1',
  slug: 'apollo',
} as ProjectDetail['project'];

const editorData = { root: { children: [] } };
const composer = (markdown: string) => ({
  clearContent: vi.fn(),
  editor: {} as never,
  getEditorData: () => editorData,
  getMarkdownContent: () => markdown,
});

const image = {
  file: { name: 'shot.png', size: 1, type: 'image/png' },
  fileUrl: 'https://cdn/shot.png',
  id: 'file_1',
  status: 'success',
};

describe('useProjectComposer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.agentMap = { coordinator: {} };
    mocks.fileList = [];
  });

  /**
   * @example Project home: a sent message opened "topic not found" — the
   * `?message=` auto-send fired before the page bound the project topic, so it
   * created a second topic outside the project and lost the attachments.
   */
  it('sends the message and its attachments into the project conversation it creates', async () => {
    mocks.createProjectTopic.mockResolvedValue({ id: 'tpc_1' });
    mocks.fileList = [image];
    const { result } = renderHook(() => useProjectComposer(project, 'chat'));
    const input = composer('  Plan the next milestone\nwith details  ');

    await act(async () => {
      await result.current.send(input);
    });

    expect(mocks.createProjectTopic).toHaveBeenCalledWith({
      agentId: 'coordinator',
      projectId: 'prj_1',
      title: 'Plan the next milestone',
    });
    expect(mocks.sendMessage).toHaveBeenCalledWith({
      context: { agentId: 'coordinator', topicId: 'tpc_1' },
      editorData,
      files: [image],
      inputEditor: null,
      message: 'Plan the next milestone\nwith details',
    });
    expect(mocks.navigate).toHaveBeenCalledWith('/project/apollo/conversation/tpc_1');
    expect(input.clearContent).toHaveBeenCalled();
    expect(mocks.clearChatUploadFileList).toHaveBeenCalled();
    expect(mocks.createTask).not.toHaveBeenCalled();
  });

  it('loads the main agent config before sending to it', async () => {
    mocks.agentMap = {};
    mocks.getAgentConfigById.mockResolvedValue({ model: 'm' });
    mocks.createProjectTopic.mockResolvedValue({ id: 'tpc_1' });
    const { result } = renderHook(() => useProjectComposer(project, 'chat'));

    await act(async () => {
      await result.current.send(composer('Hello'));
    });

    expect(mocks.internal_dispatchAgentMap).toHaveBeenCalledWith('coordinator', { model: 'm' });
    expect(mocks.sendMessage).toHaveBeenCalled();
  });

  it('records a project task with its attachments in task mode', async () => {
    mocks.createTask.mockResolvedValue({ id: 'task_1', name: 'Ship it' });
    mocks.fileList = [image];
    const { result } = renderHook(() => useProjectComposer(project, 'task'));

    await act(async () => {
      await result.current.send(composer('Ship it\nwith the changelog'));
    });

    expect(mocks.createTask).toHaveBeenCalledWith(
      expect.objectContaining({
        assigneeAgentId: 'coordinator',
        instruction: 'Ship it\nwith the changelog',
        name: 'Ship it',
        projectId: 'prj_1',
      }),
    );
    expect(mocks.clearChatUploadFileList).toHaveBeenCalledWith(['file_1']);
    expect(mocks.navigate).toHaveBeenCalledWith('/task/task_1/ship-it');
    expect(mocks.createProjectTopic).not.toHaveBeenCalled();
    expect(mocks.sendMessage).not.toHaveBeenCalled();
  });

  it('ignores an empty composer and keeps a failed send in it', async () => {
    mocks.createProjectTopic.mockRejectedValue(new Error('denied'));
    const { result } = renderHook(() => useProjectComposer(project, 'chat'));

    await act(async () => {
      await result.current.send(composer('   '));
    });
    expect(mocks.createProjectTopic).not.toHaveBeenCalled();

    const input = composer('Hello');
    await act(async () => {
      await expect(result.current.send(input)).rejects.toThrow('denied');
    });

    expect(mocks.sendMessage).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(input.clearContent).not.toHaveBeenCalled();
    expect(result.current.sending).toBe(false);
  });

  it('refuses to send while an attachment is still uploading', async () => {
    mocks.fileList = [{ ...image, fileUrl: undefined, status: 'uploading' }];
    const { result } = renderHook(() => useProjectComposer(project, 'chat'));

    await act(async () => {
      await expect(result.current.send(composer('Hello'))).rejects.toBeInstanceOf(
        AttachmentsNotReadyError,
      );
    });

    expect(mocks.createProjectTopic).not.toHaveBeenCalled();
  });

  it('titles a conversation by its first line', () => {
    expect(toConversationTitle('a'.repeat(60))).toBe(`${'a'.repeat(50)}…`);
    expect(toConversationTitle('\n  Short  \nrest')).toBe('Short');
  });
});
