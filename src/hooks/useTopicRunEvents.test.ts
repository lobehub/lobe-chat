import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useChatStore } from '@/store/chat';

import {
  latestRunningTopicOperation,
  MARKER_RETRY_DELAYS,
  syncRemoteTopicRun,
  useTopicRunEvents,
} from './useTopicRunEvents';

const topicWithRun = (operationId?: string) => ({
  id: 'tpc-1',
  metadata: operationId ? { runningOperation: { assistantMessageId: 'msg-a', operationId } } : {},
  title: 'Topic',
});

/** `markers[i]` is what the i-th detail read returns. */
const setup = ({
  localRun = false,
  marker,
  markers = [],
}: { localRun?: boolean; marker?: string; markers?: (string | undefined)[] } = {}) => {
  const refreshMessages = vi.fn().mockResolvedValue(undefined);
  let reads = 0;
  const refreshTopicDetail = vi.fn(async () => {
    const next = markers[Math.min(reads++, markers.length - 1)];
    useChatStore.setState({ topicDetailMap: { 'tpc-1': topicWithRun(next) as any } });
  });
  useChatStore.setState({
    gatewayFeed: {},
    operations: localRun
      ? {
          'op-local': {
            context: { agentId: 'agt-1', topicId: 'tpc-1' },
            id: 'op-local',
            metadata: {},
            status: 'running',
            type: 'sendMessage',
          } as any,
        }
      : {},
    refreshMessages,
    refreshTopicDetail,
    topicDataMap: {},
    topicDetailMap: { 'tpc-1': topicWithRun(marker) as any },
  });
  return { refreshMessages, refreshTopicDetail };
};

const sync = () =>
  syncRemoteTopicRun({ agentId: 'agt-1', operationId: 'op-remote', topicId: 'tpc-1' });

describe('latestRunningTopicOperation', () => {
  it('picks the newest running main-line run of the topic from the hub feed', () => {
    useChatStore.setState({
      gatewayFeed: {
        'op-child': {
          at: 5,
          meta: { parentOperationId: 'op-a', topicId: 'tpc-1' },
          status: 'running',
        },
        'op-done': { at: 4, meta: { topicId: 'tpc-1' }, status: 'completed' },
        'op-a': { at: 1, meta: { topicId: 'tpc-1' }, status: 'running' },
        'op-b': { at: 2, meta: { topicId: 'tpc-1' }, status: 'running' },
        'op-other': { at: 3, meta: { topicId: 'tpc-2' }, status: 'running' },
        'op-thread': { at: 6, meta: { threadId: 'thd-1', topicId: 'tpc-1' }, status: 'running' },
      } as any,
    });

    expect(latestRunningTopicOperation('tpc-1')(useChatStore.getState())).toBe('op-b');
  });
});

describe('syncRemoteTopicRun', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reads the new run marker and the new turn when another device starts a run', async () => {
    const { refreshMessages, refreshTopicDetail } = setup({ markers: ['op-remote'] });

    await sync();

    expect(refreshTopicDetail).toHaveBeenCalledTimes(1);
    expect(refreshTopicDetail).toHaveBeenCalledWith('tpc-1', true);
    expect(refreshMessages).toHaveBeenCalledWith({ agentId: 'agt-1', topicId: 'tpc-1' });
  });

  it('re-reads the detail until the server has written the marker', async () => {
    const { refreshTopicDetail } = setup({ markers: [undefined, undefined, 'op-remote'] });

    const done = sync();
    await vi.runAllTimersAsync();
    await done;

    expect(refreshTopicDetail).toHaveBeenCalledTimes(3);
  });

  it('gives up after the retry budget when no marker ever appears', async () => {
    const { refreshTopicDetail } = setup({ markers: [undefined] });

    const done = sync();
    await vi.runAllTimersAsync();
    await done;

    expect(refreshTopicDetail).toHaveBeenCalledTimes(MARKER_RETRY_DELAYS.length);
  });

  it('leaves a run this client started (or already streams) to its own connection', async () => {
    const { refreshMessages, refreshTopicDetail } = setup({ localRun: true });

    await sync();

    expect(refreshTopicDetail).not.toHaveBeenCalled();
    expect(refreshMessages).not.toHaveBeenCalled();
  });

  it('ignores a run whose marker it already holds', async () => {
    const { refreshMessages, refreshTopicDetail } = setup({ marker: 'op-remote' });

    await sync();

    expect(refreshTopicDetail).not.toHaveBeenCalled();
    expect(refreshMessages).not.toHaveBeenCalled();
  });
});

describe('useTopicRunEvents', () => {
  it('syncs when the hub reports a new running operation on the shown topic', async () => {
    const { refreshTopicDetail } = setup({ markers: ['op-remote'] });
    renderHook(() => useTopicRunEvents('tpc-1', 'agt-1'));
    expect(refreshTopicDetail).not.toHaveBeenCalled();

    await act(async () => {
      useChatStore.setState({
        gatewayFeed: {
          'op-remote': { at: 1, meta: { topicId: 'tpc-1' }, status: 'running' },
        } as any,
      });
    });

    expect(refreshTopicDetail).toHaveBeenCalledWith('tpc-1', true);
  });
});
