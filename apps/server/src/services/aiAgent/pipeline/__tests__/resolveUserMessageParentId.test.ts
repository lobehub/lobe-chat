import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveUserMessageParentId } from '../resolveUserMessageParentId';

const messageModel = {
  findById: vi.fn(),
  getLatestNonToolMessageId: vi.fn(),
  getLatestSpineMessageId: vi.fn(),
  isMessageDescendantOf: vi.fn(),
};

const resolve = (clientParentId?: string, threadId: string | null = null) =>
  resolveUserMessageParentId(messageModel as any, { clientParentId, threadId, topicId: 'tpc_1' });

describe('resolveUserMessageParentId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    messageModel.getLatestSpineMessageId.mockResolvedValue('msg_spine');
    messageModel.getLatestNonToolMessageId.mockResolvedValue(undefined);
    messageModel.isMessageDescendantOf.mockResolvedValue(false);
    messageModel.findById.mockResolvedValue(undefined);
  });

  it('anchors on the spine head when the caller renders no conversation', async () => {
    await expect(resolve()).resolves.toBe('msg_spine');
    expect(messageModel.isMessageDescendantOf).not.toHaveBeenCalled();
  });

  it('keeps the turn on the visible branch when the newest row sits on a hidden sibling', async () => {
    // LOBE-14875: after a regenerate, `activeBranchIndex` selected the older
    // branch while the newest row lived on the regenerated one.
    messageModel.findById.mockResolvedValue({
      id: 'msg_visible_tail',
      role: 'assistant',
      threadId: null,
      topicId: 'tpc_1',
    });

    await expect(resolve('msg_visible_tail')).resolves.toBe('msg_visible_tail');
    expect(messageModel.isMessageDescendantOf).toHaveBeenCalledWith({
      ancestorId: 'msg_visible_tail',
      descendantId: 'msg_spine',
      topicId: 'tpc_1',
    });
  });

  it('advances a stale tail to the spine head that extends the same branch', async () => {
    messageModel.isMessageDescendantOf.mockResolvedValue(true);

    await expect(resolve('msg_stale_tail')).resolves.toBe('msg_spine');
    expect(messageModel.findById).not.toHaveBeenCalled();
  });

  it('skips the branch check when the tail already is the spine head', async () => {
    await expect(resolve('msg_spine')).resolves.toBe('msg_spine');
    expect(messageModel.isMessageDescendantOf).not.toHaveBeenCalled();
  });

  it('ignores a tail from another topic or thread', async () => {
    messageModel.findById.mockResolvedValueOnce({
      role: 'assistant',
      threadId: null,
      topicId: 'x',
    });
    await expect(resolve('msg_foreign')).resolves.toBe('msg_spine');

    messageModel.findById.mockResolvedValueOnce({
      role: 'assistant',
      threadId: 'thd_1',
      topicId: 'tpc_1',
    });
    await expect(resolve('msg_in_thread')).resolves.toBe('msg_spine');
  });

  it('parents off the assistant that owns a tool-result tail', async () => {
    messageModel.findById.mockResolvedValue({
      parentId: 'msg_tool_owner',
      role: 'tool',
      threadId: null,
      topicId: 'tpc_1',
    });

    await expect(resolve('msg_tool_result')).resolves.toBe('msg_tool_owner');
  });

  it('falls back to the latest non-tool row when there is no spine head or valid tail', async () => {
    messageModel.getLatestSpineMessageId.mockResolvedValue(undefined);
    messageModel.getLatestNonToolMessageId.mockResolvedValue('msg_signal_turn');

    await expect(resolve('msg_missing')).resolves.toBe('msg_signal_turn');
    expect(messageModel.getLatestNonToolMessageId).toHaveBeenCalledWith({
      threadId: null,
      topicId: 'tpc_1',
    });
  });
});
