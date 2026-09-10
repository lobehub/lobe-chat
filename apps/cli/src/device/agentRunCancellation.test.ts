import type * as ChildProcessModule from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { executeToolCall } from '../tools';
import { spawnHeteroAgentRun } from './agentRun';

const { spawnMock } = vi.hoisted(() => ({ spawnMock: vi.fn() }));
vi.mock('node:child_process', async (original) => ({
  ...(await original<typeof ChildProcessModule>()),
  spawn: spawnMock,
}));

const children: EventEmitter[] = [];
afterEach(() => {
  for (const child of children.splice(0)) child.emit('close', 0, null);
  vi.useRealTimers();
  spawnMock.mockReset();
});

async function dispatch(operationId: string) {
  const child = Object.assign(new EventEmitter(), {
    kill: vi.fn().mockReturnValue(true),
    pid: 12345,
    stdin: { end: vi.fn(), write: vi.fn() },
  });
  children.push(child);
  spawnMock.mockReturnValue(child as unknown as ChildProcess);
  const ack = spawnHeteroAgentRun({
    agentType: 'kimi-code',
    jwt: 'fixture',
    operationId,
    prompt: 'fixture',
    serverUrl: 'http://localhost',
    topicId: 'fixture-topic',
  });
  child.emit('spawn');
  await ack;
  return child;
}

describe('gateway-dispatched CLI agent cancellation', () => {
  it('waits for the dispatched wrapper to close and returns structured exit confirmation', async () => {
    const child = await dispatch('cancel-live');
    let settled = false;
    const result = executeToolCall(
      'cancelHeteroTask',
      JSON.stringify({ taskId: 'cancel-live' }),
    ).then((value) => {
      settled = true;
      return value;
    });
    await vi.waitFor(() => expect(child.kill).toHaveBeenCalledWith('SIGINT'));
    expect(settled).toBe(false);
    child.emit('close', 0, 'SIGINT');
    await expect(result).resolves.toMatchObject({
      success: true,
      state: { exited: true, pid: 12345 },
    });
    await expect(
      executeToolCall('cancelHeteroTask', JSON.stringify({ taskId: 'cancel-live' })),
    ).resolves.toMatchObject({ success: true, state: { exited: true } });
    expect(child.kill).toHaveBeenCalledTimes(1);
  });

  it('does not report a live unresponsive writer as successfully canceled', async () => {
    vi.useFakeTimers();
    const child = await dispatch('cancel-timeout');
    const result = executeToolCall(
      'cancelHeteroTask',
      JSON.stringify({ taskId: 'cancel-timeout' }),
    );
    await vi.advanceTimersByTimeAsync(4100);
    await expect(result).resolves.toMatchObject({ success: false, state: { exited: false } });
    expect(child.kill.mock.calls).toEqual([['SIGINT'], ['SIGINT']]);
  });

  it('does not wrap a missing operation in a successful gateway response', async () => {
    await expect(
      executeToolCall('cancelHeteroTask', JSON.stringify({ taskId: 'not-dispatched' })),
    ).resolves.toMatchObject({ success: false, state: { success: false } });
  });
});
