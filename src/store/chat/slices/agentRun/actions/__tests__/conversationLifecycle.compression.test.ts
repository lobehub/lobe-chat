import { toast } from '@lobehub/ui';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';

import { useChatStore } from '../../../../store';
import { createMockMessage, TEST_IDS } from './fixtures';
import { resetTestEnvironment, setupMockSelectors } from './helpers';

vi.mock('@/services/resourcePermission', () => ({
  resourcePermissionService: { getGeneralAccess: vi.fn() },
}));

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    session: { updateSession: { mutate: vi.fn().mockResolvedValue(undefined) } },
  },
}));

const agentId = TEST_IDS.SESSION_ID;
const topicId = TEST_IDS.TOPIC_ID;
const context = { agentId, threadId: null, topicId };
const key = messageMapKey({ agentId, topicId });
const originalMessages = [
  createMockMessage({ content: 'question', id: 'user-1', role: 'user', topicId }),
  createMockMessage({ content: 'answer', id: 'assistant-1', role: 'assistant', topicId }),
];

const getMessageIds = () => (useChatStore.getState().dbMessagesMap[key] ?? []).map((m) => m.id);

beforeEach(() => {
  resetTestEnvironment();
  setupMockSelectors();

  act(() => {
    useChatStore.setState({
      activeAgentId: agentId,
      activeTopicId: topicId,
      dbMessagesMap: { [key]: originalMessages },
      messagesMap: { [key]: originalMessages },
    });
  });

  vi.spyOn(messageService, 'createCompressionGroup').mockResolvedValue({
    messageGroupId: 'group-1',
    messages: [{ content: '', id: 'group-1', role: 'compressedGroup' } as any],
    messagesToSummarize: originalMessages,
  });
  vi.spyOn(messageService, 'cancelCompression').mockResolvedValue({
    messages: originalMessages,
  });
  vi.spyOn(toast, 'error').mockImplementation(() => ({}) as any);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('executeCompression', () => {
  it('keeps the original messages when the summary request fails', async () => {
    const finalizeSpy = vi.spyOn(messageService, 'finalizeCompression');
    vi.spyOn(chatService, 'fetchPresetTaskResult').mockImplementation(async ({ onError }) => {
      onError?.(new Error('Request blocked by chat security'), undefined);
    });

    let succeeded: boolean | undefined;
    await act(async () => {
      succeeded = await useChatStore.getState().executeCompression(context, '');
    });

    expect(succeeded).toBe(false);
    expect(finalizeSpy).not.toHaveBeenCalled();
    expect(messageService.cancelCompression).toHaveBeenCalledWith({
      agentId,
      groupId: undefined,
      messageGroupId: 'group-1',
      threadId: null,
      topicId,
    });
    expect(getMessageIds()).toEqual(['user-1', 'assistant-1']);
    expect(toast.error).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Request blocked by chat security' }),
    );
  });

  it('does not finalize an empty summary', async () => {
    const finalizeSpy = vi.spyOn(messageService, 'finalizeCompression');
    vi.spyOn(chatService, 'fetchPresetTaskResult').mockImplementation(
      async ({ onMessageHandle }) => {
        onMessageHandle?.({ text: '  ', type: 'text' });
      },
    );

    let succeeded: boolean | undefined;
    await act(async () => {
      succeeded = await useChatStore.getState().executeCompression(context, '');
    });

    expect(succeeded).toBe(false);
    expect(finalizeSpy).not.toHaveBeenCalled();
    expect(messageService.cancelCompression).toHaveBeenCalledTimes(1);
    expect(getMessageIds()).toEqual(['user-1', 'assistant-1']);
  });

  it('finalizes the group with the generated summary', async () => {
    const finalized = [{ content: 'summary', id: 'group-1', role: 'compressedGroup' } as any];
    const finalizeSpy = vi
      .spyOn(messageService, 'finalizeCompression')
      .mockResolvedValue({ messages: finalized });
    vi.spyOn(chatService, 'fetchPresetTaskResult').mockImplementation(
      async ({ onMessageHandle }) => {
        onMessageHandle?.({ text: 'summary', type: 'text' });
      },
    );

    let succeeded: boolean | undefined;
    await act(async () => {
      succeeded = await useChatStore.getState().executeCompression(context, '');
    });

    expect(succeeded).toBe(true);
    expect(finalizeSpy).toHaveBeenCalledWith({
      agentId,
      content: 'summary',
      messageGroupId: 'group-1',
      topicId,
    });
    expect(messageService.cancelCompression).not.toHaveBeenCalled();
    expect(getMessageIds()).toEqual(['group-1']);
  });
});
