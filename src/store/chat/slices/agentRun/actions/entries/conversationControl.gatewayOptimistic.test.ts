import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { lambdaClient } from '@/libs/trpc/client';

import { useChatStore } from '../../../../store';
import { messageMapKey } from '../../../../utils/messageMapKey';
import { mergeFetchedMessagesWithLocalState } from '../../../message/transcript/mergeFetched';
import { createMockMessage } from '../__tests__/fixtures';
import { resetTestEnvironment } from '../__tests__/helpers';

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    aiAgent: {
      resolveAgentInterventionBySource: { mutate: vi.fn() },
    },
  },
}));

vi.mock('@/utils/localStorage', () => {
  class AsyncLocalStorage<State> {
    getFromLocalStorageSync(): State {
      return {} as State;
    }

    async getFromLocalStorage(): Promise<State> {
      return {} as State;
    }

    async saveToLocalStorage(): Promise<void> {
      return undefined;
    }
  }

  return { AsyncLocalStorage };
});

const agentId = 'server-agent';
const topicId = 'server-topic';
const chatKey = messageMapKey({ agentId, topicId });

const createDeferred = () => {
  let reject!: (error: Error) => void;
  let resolve!: () => void;
  const promise = new Promise<any>((res, rej) => {
    resolve = () => res({});
    reject = rej;
  });
  return { promise, reject, resolve };
};

const seedPendingTools = (ids: string[]) => {
  const assistant = createMockMessage({ id: 'assistant-1', role: 'assistant' });
  const tools = ids.map((id) =>
    createMockMessage({
      id,
      parentId: assistant.id,
      plugin: { apiName: 'writeFile', arguments: '{}', identifier: 'fs', type: 'default' },
      pluginIntervention: { batchId: 'batch-1', operationId: 'operation-1', status: 'pending' },
      role: 'tool',
      tool_call_id: `call-${id}`,
    } as any),
  );
  act(() => {
    useChatStore.setState({
      activeAgentId: agentId,
      activeTopicId: topicId,
      dbMessagesMap: { [chatKey]: [assistant, ...tools] },
      messagesMap: { [chatKey]: [assistant, ...tools] },
    });
  });
};

const interventionOf = (id: string) =>
  useChatStore.getState().dbMessagesMap[chatKey].find((message) => message.id === id)
    ?.pluginIntervention;

beforeEach(() => {
  resetTestEnvironment();
  vi.mocked(lambdaClient.aiAgent.resolveAgentInterventionBySource.mutate)
    .mockReset()
    .mockResolvedValue({ contractVersion: 2, status: 'unavailable', success: false } as any);
  useChatStore.setState({ updateTopicStatus: vi.fn().mockResolvedValue(undefined) });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Gateway approval cards update before the resume returns', () => {
  const setupGateway = () => {
    const { result } = renderHook(() => useChatStore());
    vi.spyOn(result.current, 'isGatewayModeEnabled').mockReturnValue(true);
    const persist = vi
      .spyOn(result.current, 'optimisticUpdateMessagePlugin')
      .mockResolvedValue(undefined);
    const resume = createDeferred();
    vi.spyOn(result.current, 'executeGatewayAgent').mockReturnValue(resume.promise);
    return { persist, result, resume };
  };

  it('shows approval while the resume is in flight without persisting it', async () => {
    seedPendingTools(['tool-1']);
    const { persist, result, resume } = setupGateway();

    let approval!: Promise<void>;
    await act(async () => {
      approval = result.current.approveToolCalling('tool-1', '');
      await vi.waitFor(() => expect(result.current.executeGatewayAgent).toHaveBeenCalled());
    });

    expect(interventionOf('tool-1')).toMatchObject({ batchId: 'batch-1', status: 'approved' });
    expect(persist).not.toHaveBeenCalled();

    await act(async () => {
      resume.resolve();
      await approval;
    });
  });

  it('restores the pending card when the approval resume fails', async () => {
    seedPendingTools(['tool-1']);
    const { result, resume } = setupGateway();
    resume.reject(new Error('network error'));

    await act(async () => {
      await expect(result.current.approveToolCalling('tool-1', '')).rejects.toThrow(
        'network error',
      );
    });

    expect(interventionOf('tool-1')).toMatchObject({ batchId: 'batch-1', status: 'pending' });
  });

  it('marks every card of an approve-all batch approved while the resume is in flight', async () => {
    seedPendingTools(['tool-1', 'tool-2']);
    const { result, resume } = setupGateway();

    let approval!: Promise<void>;
    await act(async () => {
      approval = result.current.approveAllToolCalls(['tool-1', 'tool-2']);
      await vi.waitFor(() => expect(result.current.executeGatewayAgent).toHaveBeenCalled());
    });

    expect(interventionOf('tool-1')?.status).toBe('approved');
    expect(interventionOf('tool-2')?.status).toBe('approved');

    await act(async () => {
      resume.resolve();
      await approval;
    });
  });

  it('shows the rejection while the resume is in flight and restores the card on failure', async () => {
    seedPendingTools(['tool-1']);
    const { result, resume } = setupGateway();

    let rejection!: Promise<void>;
    await act(async () => {
      rejection = result.current.rejectAndContinueToolCalling('tool-1', 'not now');
      await vi.waitFor(() => expect(result.current.executeGatewayAgent).toHaveBeenCalled());
    });

    expect(interventionOf('tool-1')).toMatchObject({
      rejectedReason: 'not now',
      status: 'rejected',
    });

    await act(async () => {
      resume.reject(new Error('network error'));
      await expect(rejection).rejects.toThrow('network error');
    });

    expect(interventionOf('tool-1')).toMatchObject({ batchId: 'batch-1', status: 'pending' });
  });

  it('lets the server state win when another device already resolved the card', async () => {
    seedPendingTools(['tool-1']);
    const { result } = setupGateway();
    vi.mocked(lambdaClient.aiAgent.resolveAgentInterventionBySource.mutate).mockResolvedValueOnce({
      contractVersion: 2,
      state: 'already_resolved',
      status: 'resolved',
      success: true,
    } as any);
    const serverRow = {
      ...useChatStore.getState().dbMessagesMap[chatKey][1],
      pluginIntervention: { batchId: 'batch-1', operationId: 'operation-1', status: 'rejected' },
    } as any;
    let merged: any[] = [];
    vi.spyOn(result.current, 'refreshMessages').mockImplementation(async () => {
      // Run the real merge the refresh applies, against the local rows at refresh time.
      merged = mergeFetchedMessagesWithLocalState(
        [serverRow],
        useChatStore.getState().dbMessagesMap[chatKey],
        new Set(),
        new Set(),
      );
    });

    await act(async () => {
      await result.current.approveToolCalling('tool-1', '');
    });

    expect(merged.find((message) => message.id === 'tool-1')?.pluginIntervention?.status).toBe(
      'rejected',
    );
  });

  it('does not undo a server state that landed before the resume failed', async () => {
    seedPendingTools(['tool-1']);
    const { result, resume } = setupGateway();

    let approval!: Promise<void>;
    await act(async () => {
      approval = result.current.approveToolCalling('tool-1', '');
      await vi.waitFor(() => expect(result.current.executeGatewayAgent).toHaveBeenCalled());
    });
    act(() => {
      useChatStore.getState().internal_dispatchMessage(
        {
          id: 'tool-1',
          type: 'updateMessage',
          value: { pluginIntervention: { ...interventionOf('tool-1'), status: 'aborted' } },
        },
        { context: { agentId, topicId } },
      );
    });

    await act(async () => {
      resume.reject(new Error('network error'));
      await expect(approval).rejects.toThrow('network error');
    });

    expect(interventionOf('tool-1')?.status).toBe('aborted');
  });

  it('keeps a server-confirmed approval when the resume fails afterwards', async () => {
    seedPendingTools(['tool-1']);
    const { result, resume } = setupGateway();

    let approval!: Promise<void>;
    await act(async () => {
      approval = result.current.approveToolCalling('tool-1', '');
      await vi.waitFor(() => expect(result.current.executeGatewayAgent).toHaveBeenCalled());
    });
    act(() => {
      useChatStore.getState().internal_dispatchMessage(
        {
          id: 'tool-1',
          type: 'updateMessage',
          value: {
            pluginIntervention: {
              ...interventionOf('tool-1'),
              resolutionRequestId: 'request-1',
              status: 'approved',
            },
          },
        },
        { context: { agentId, topicId } },
      );
    });

    await act(async () => {
      resume.reject(new Error('network error'));
      await expect(approval).rejects.toThrow('network error');
    });

    expect(interventionOf('tool-1')?.status).toBe('approved');
  });

  it('keeps the claim request on the still-pending server row', async () => {
    seedPendingTools(['tool-1']);
    const { result, resume } = setupGateway();
    resume.resolve();

    await act(async () => {
      await result.current.approveToolCalling('tool-1', '');
    });

    expect(lambdaClient.aiAgent.resolveAgentInterventionBySource.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ batchId: 'batch-1', operationId: 'operation-1' }),
    );
  });
});
