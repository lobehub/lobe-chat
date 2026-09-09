// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { FeishuMessageService } from './service';

const makeService = (listMessages: ReturnType<typeof vi.fn>) =>
  new FeishuMessageService({ listMessages } as any, 'feishu');

describe('FeishuMessageService.reactToMessage', () => {
  it('translates unicode into the named emoji_type Feishu actually accepts', async () => {
    const addReaction = vi.fn().mockResolvedValue(undefined);
    const service = new FeishuMessageService({ addReaction } as any, 'feishu');

    await service.reactToMessage({
      emoji: '\u{1F44D}',
      messageId: 'om_1',
      platform: 'feishu',
    } as any);

    // Passing the unicode straight through is what returns `231001`.
    expect(addReaction).toHaveBeenCalledWith('om_1', 'THUMBSUP');
  });

  it('rejects an emoji Feishu has no equivalent for, naming what it does accept', async () => {
    const addReaction = vi.fn().mockResolvedValue(undefined);
    const service = new FeishuMessageService({ addReaction } as any, 'feishu');

    await expect(
      service.reactToMessage({ emoji: '\u{1F984}', messageId: 'om_1', platform: 'feishu' } as any),
    ).rejects.toThrow('THUMBSUP');
    expect(addReaction).not.toHaveBeenCalled();
  });
});

describe('FeishuMessageService.readMessages', () => {
  it('returns normalized messages on success', async () => {
    const listMessages = vi.fn().mockResolvedValue({
      has_more: false,
      hasMore: false,
      items: [
        {
          body: { content: JSON.stringify({ text: 'hi' }) },
          create_time: '1700000000000',
          message_id: 'om_1',
          sender: { id: 'ou_1' },
        },
      ],
    });

    const result = await makeService(listMessages).readMessages({
      channelId: 'oc_chat_1',
      platform: 'feishu',
    } as any);

    expect(listMessages).toHaveBeenCalledWith('oc_chat_1', expect.any(Object));
    expect(result.channelId).toBe('oc_chat_1');
    expect(result.messages).toHaveLength(1);
  });

  it.each([
    ['230027', 'im:message.group_msg'],
    ['230002', 'not a member of this chat'],
    ['230006', 'bot capability is not enabled'],
    ['230073', 'not visible to the bot'],
  ])(
    'turns Feishu error %s into an actionable hint instead of a bare code',
    async (code, expected) => {
      const listMessages = vi
        .fn()
        .mockRejectedValue(
          new Error(`Lark API GET /im/v1/messages failed: ${code} Permission denied`),
        );

      await expect(
        makeService(listMessages).readMessages({
          channelId: 'oc_chat_1',
          platform: 'feishu',
        } as any),
      ).rejects.toThrow(expected);
    },
  );

  it('leaves unrecognized failures untouched so they stay debuggable', async () => {
    const listMessages = vi.fn().mockRejectedValue(new Error('socket hang up'));

    await expect(
      makeService(listMessages).readMessages({
        channelId: 'oc_chat_1',
        platform: 'feishu',
      } as any),
    ).rejects.toThrow('socket hang up');
  });
});
