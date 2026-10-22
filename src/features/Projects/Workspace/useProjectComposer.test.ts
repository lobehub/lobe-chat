/**
 * @vitest-environment happy-dom
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProjectDetail } from '@/store/project';

import { toConversationTitle, useProjectComposer } from './useProjectComposer';

const mocks = vi.hoisted(() => ({
  createProjectTopic: vi.fn(),
  createTask: vi.fn(),
  navigate: vi.fn(),
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

const project = {
  coordinatorAgentId: 'coordinator',
  id: 'prj_1',
  slug: 'apollo',
} as ProjectDetail['project'];

describe('useProjectComposer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens a coordinator conversation owned by the project and sends the message in it', async () => {
    mocks.createProjectTopic.mockResolvedValue({ id: 'tpc_1' });
    const { result } = renderHook(() => useProjectComposer(project));

    act(() => result.current.setDraft('  Plan the next milestone\nwith details  '));
    let sent = false;
    await act(async () => {
      sent = await result.current.send('chat');
    });

    expect(sent).toBe(true);
    expect(result.current.draft).toBe('');
    expect(mocks.createProjectTopic).toHaveBeenCalledWith({
      agentId: 'coordinator',
      projectId: 'prj_1',
      title: 'Plan the next milestone',
    });
    expect(mocks.navigate).toHaveBeenCalledWith(
      '/project/apollo/conversation/tpc_1?message=Plan%20the%20next%20milestone%0Awith%20details',
    );
    expect(mocks.createTask).not.toHaveBeenCalled();
  });

  it('records a project task assigned to the coordinator in task mode', async () => {
    mocks.createTask.mockResolvedValue({ id: 'task_1', name: 'Ship it' });
    const { result } = renderHook(() => useProjectComposer(project));

    act(() => result.current.setDraft('Ship it'));
    await act(async () => {
      await result.current.send('task');
    });

    expect(mocks.createTask).toHaveBeenCalledWith({
      assigneeAgentId: 'coordinator',
      instruction: 'Ship it',
      projectId: 'prj_1',
    });
    expect(mocks.navigate).toHaveBeenCalledWith('/task/task_1/ship-it');
    expect(mocks.createProjectTopic).not.toHaveBeenCalled();
  });

  it('ignores a blank message and keeps a failed send in the composer', async () => {
    mocks.createProjectTopic.mockRejectedValue(new Error('denied'));
    const { result } = renderHook(() => useProjectComposer(project));

    act(() => result.current.setDraft('   '));
    await act(async () => {
      expect(await result.current.send('chat')).toBe(false);
    });
    act(() => result.current.setDraft('Hello'));
    await act(async () => {
      await expect(result.current.send('chat')).rejects.toThrow('denied');
    });

    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(result.current.draft).toBe('Hello');
    expect(result.current.sending).toBe(false);
  });

  it('keeps a draft picked while the previous send was still pending', async () => {
    let resolveTopic!: (topic: { id: string }) => void;
    mocks.createProjectTopic.mockImplementation(
      () => new Promise((resolve) => (resolveTopic = resolve)),
    );
    const { result } = renderHook(() => useProjectComposer(project));

    act(() => result.current.setDraft('First'));
    let pending!: Promise<boolean>;
    act(() => {
      pending = result.current.send('chat');
    });
    act(() => result.current.setDraft('Find the current blockers'));
    await act(async () => {
      resolveTopic({ id: 'tpc_1' });
      await pending;
    });

    expect(result.current.draft).toBe('Find the current blockers');
  });

  it('titles a conversation by its first line', () => {
    expect(toConversationTitle('a'.repeat(60))).toBe(`${'a'.repeat(50)}…`);
    expect(toConversationTitle('\n  Short  \nrest')).toBe('Short');
  });
});
