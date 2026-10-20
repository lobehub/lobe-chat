/**
 * @vitest-environment happy-dom
 */
import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createReplicaState } from '@/libs/replica';
import { useAgentStore } from '@/store/agent';

import { canSendOnSlugRoute } from './useSlugRouteSendGuard';

const confirmedEntry = { source: 'server' } as any;
const storageEntry = { source: 'storage' } as any;

describe('canSendOnSlugRoute', () => {
  const confirmAgentSlugTarget = vi.fn();

  beforeEach(() => {
    confirmAgentSlugTarget.mockReset();
    act(() =>
      useAgentStore.setState({
        agentSlugIdMap: {},
        agentSlugIdReplica: createReplicaState(),
        confirmAgentSlugTarget,
      } as any),
    );
  });

  const seed = (agentId: string, entry: unknown) =>
    act(() =>
      useAgentStore.setState({
        agentSlugIdMap: { 'my-writer': agentId },
        agentSlugIdReplica: { ...createReplicaState(), entries: { 'my-writer': entry } } as any,
      }),
    );

  it('never holds an id route or a builtin slug', async () => {
    await expect(canSendOnSlugRoute('agt_plain')).resolves.toBe(true);
    await expect(canSendOnSlugRoute('inbox')).resolves.toBe(true);
    expect(confirmAgentSlugTarget).not.toHaveBeenCalled();
  });

  it('sends at once when the server already confirmed the slug', async () => {
    seed('agt_writer', confirmedEntry);

    await expect(canSendOnSlugRoute('my-writer')).resolves.toBe(true);
    expect(confirmAgentSlugTarget).not.toHaveBeenCalled();
  });

  // Codex P1: the agent painted from the local copy may no longer own the slug.
  it('holds a send to the locally painted agent until the server names that same agent', async () => {
    seed('agt_writer', storageEntry);
    confirmAgentSlugTarget.mockResolvedValue('agt_writer');

    await expect(canSendOnSlugRoute('my-writer')).resolves.toBe(true);
    expect(confirmAgentSlugTarget).toHaveBeenCalledWith('my-writer');
  });

  it('blocks the send when the slug moved to another agent', async () => {
    seed('agt_old', storageEntry);
    confirmAgentSlugTarget.mockResolvedValue('agt_new');

    await expect(canSendOnSlugRoute('my-writer')).resolves.toBe(false);
  });

  it('blocks the send when the lookup fails or nothing names the slug', async () => {
    seed('agt_writer', storageEntry);
    confirmAgentSlugTarget.mockRejectedValueOnce(new Error('offline'));
    await expect(canSendOnSlugRoute('my-writer')).resolves.toBe(false);

    confirmAgentSlugTarget.mockResolvedValueOnce(undefined);
    await expect(canSendOnSlugRoute('my-writer')).resolves.toBe(false);
  });
});
