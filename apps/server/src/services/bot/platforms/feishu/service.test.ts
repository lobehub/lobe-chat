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
  it('asks for the NEWEST page and returns it in chronological order', async () => {
    // Feishu's default sort is ascending, so an unsorted first page would be
    // the oldest messages in the chat — useless for "what was just discussed".
    const item = (id: string, createTime: string) => ({
      body: { content: JSON.stringify({ text: id }) },
      create_time: createTime,
      message_id: id,
      sender: { id: 'ou_1' },
    });
    const listMessages = vi.fn().mockResolvedValue({
      hasMore: true,
      items: [
        item('om_newest', '1700000003000'),
        item('om_middle', '1700000002000'),
        item('om_oldest', '1700000001000'),
      ],
      pageToken: 'next',
    });

    const result = await makeService(listMessages).readMessages({
      channelId: 'oc_chat_1',
      cursor: 'prev',
      platform: 'feishu',
    } as any);

    expect(listMessages).toHaveBeenCalledWith(
      'oc_chat_1',
      expect.objectContaining({ pageToken: 'prev', sortType: 'ByCreateTimeDesc' }),
    );
    expect(result.channelId).toBe('oc_chat_1');
    expect(result.messages?.map((m) => m.id)).toEqual(['om_oldest', 'om_middle', 'om_newest']);
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
