import type { LarkApiClient } from '@lobechat/chat-adapter-feishu';
import debug from 'debug';

import { getAgentRuntimeRedisClient } from '@/server/modules/AgentRuntime/redis';

const log = debug('bot-platform:feishu:chat-composition');

/**
 * Is this Feishu/Lark chat just the operator and this bot?
 *
 * The router drops the @-mention requirement for a conversation that is
 * effectively 1:1 with the bot. It used to infer that from how many distinct
 * humans had *spoken* in the thread, which is a bad proxy on Feishu: a
 * subscribed "thread" there is the whole group chat, and a silent member is
 * never counted — so a 30-person group where only one person had talked read as
 * private, and the bot answered everything that person said, including messages
 * @-ing a different bot.
 *
 * `GET /im/v1/chats/{chat_id}` reports the real composition: `user_count`
 * (群内用户的数量) and `bot_count` (群内机器人的数量). Exactly one of each means
 * the operator and this bot, and nobody else.
 *
 * Fails CLOSED: any error, missing field, or absent Redis resolves to `false`,
 * which means "require an @-mention". Staying quiet when we cannot prove the
 * chat is private is the safe direction — the opposite mistake is the bot
 * talking over a group.
 */
const TTL_SECONDS = 10 * 60;

const buildKey = (applicationId: string, chatId: string): string =>
  `bot:feishu-chat-solo:${applicationId}:${chatId}`;

/** Feishu returns the counts as strings (`"bot_count": "3"`). */
const toCount = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export async function isSoloBotChat(
  api: LarkApiClient,
  applicationId: string,
  chatId: string,
): Promise<boolean> {
  // Membership changes rarely, and this is consulted on every inbound group
  // message — cache it rather than spending an API round-trip per message.
  const redis = getAgentRuntimeRedisClient();
  const key = buildKey(applicationId, chatId);
  if (redis) {
    try {
      const cached = await redis.get(key);
      if (cached === '1') return true;
      if (cached === '0') return false;
    } catch (error) {
      log('isSoloBotChat: cache read failed: %O', error);
    }
  }

  let solo: boolean;
  try {
    const chat = await api.getChatInfo(chatId);
    const userCount = toCount(chat?.user_count);
    const botCount = toCount(chat?.bot_count);
    solo = userCount === 1 && botCount === 1;
    log(
      'isSoloBotChat: chat=%s users=%o bots=%o solo=%s',
      chatId,
      chat?.user_count,
      chat?.bot_count,
      solo,
    );
  } catch (error) {
    // Reading chat info needs one of `im:chat` / `im:chat:read` /
    // `im:chat:readonly`. Without it every group simply stays mention-only.
    log('isSoloBotChat: getChatInfo failed, treating as a shared group: %O', error);
    return false;
  }

  if (redis) {
    try {
      await redis.set(key, solo ? '1' : '0', 'EX', TTL_SECONDS);
    } catch (error) {
      log('isSoloBotChat: cache write failed: %O', error);
    }
  }
  return solo;
}
