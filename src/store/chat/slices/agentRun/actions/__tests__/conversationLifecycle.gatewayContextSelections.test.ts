import type { ContextSelection } from '@lobechat/types';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { agentService } from '@/services/agent';
import { getSessionStoreState } from '@/store/session';

import { useChatStore } from '../../../../store';
import { createMockAgentConfig, TEST_IDS } from './fixtures';
import { resetTestEnvironment, setupMockSelectors, spyOnMessageService } from './helpers';

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: { session: { updateSession: { mutate: vi.fn().mockResolvedValue(undefined) } } },
}));

const context = { agentId: TEST_IDS.SESSION_ID, threadId: null, topicId: TEST_IDS.TOPIC_ID };

const contextSelections: ContextSelection[] = [
  { content: 'Quoted reply', format: 'text', id: 'selection-1', source: 'text' },
];

beforeEach(() => {
  resetTestEnvironment();
  setupMockSelectors();
  spyOnMessageService();
  vi.spyOn(getSessionStoreState(), 'triggerSessionUpdate').mockResolvedValue(undefined);
  vi.spyOn(agentService, 'getAgentConfigById').mockResolvedValue(createMockAgentConfig() as any);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('gateway send: attached selections', () => {
  // ROOT CAUSE:
  //
  // In gateway mode (e.g. Claude Code running on a device), the server persists
  // the user message and its row replaces the optimistic one. The gateway
  // request carried no selections, so the quote the user attached showed on the
  // optimistic row, then disappeared — and the agent never saw it.
  it('forwards the selections so the server persists them on the user message', async () => {
    const { result } = renderHook(() => useChatStore());
    const executeGatewayAgent = vi.fn().mockResolvedValue({
      assistantMessageId: 'msg_assistant',
      operationId: 'op_gateway',
      topicId: TEST_IDS.TOPIC_ID,
      userMessageId: 'msg_user',
    });

    act(() => {
      useChatStore.setState({ executeGatewayAgent, isGatewayModeEnabled: () => true });
    });

    await act(async () => {
      await result.current.sendMessage({ context, contextSelections, message: 'Explain this' });
    });

    expect(executeGatewayAgent).toHaveBeenCalledWith(
      expect.objectContaining({ contextSelections }),
    );
  });

  it('sends no selections when nothing is attached', async () => {
    const { result } = renderHook(() => useChatStore());
    const executeGatewayAgent = vi.fn().mockResolvedValue({
      assistantMessageId: 'msg_assistant',
      operationId: 'op_gateway',
      topicId: TEST_IDS.TOPIC_ID,
      userMessageId: 'msg_user',
    });

    act(() => {
      useChatStore.setState({ executeGatewayAgent, isGatewayModeEnabled: () => true });
    });

    await act(async () => {
      await result.current.sendMessage({ context, message: 'Explain this' });
    });

    expect(executeGatewayAgent.mock.calls[0][0].contextSelections).toBeUndefined();
    expect(executeGatewayAgent.mock.calls[0][0].pageSelections).toBeUndefined();
  });
});
