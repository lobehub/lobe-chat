// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = vi.hoisted(() => new Map<string, string>());
vi.mock('@/server/modules/AgentRuntime/redis', () => ({
  getAgentRuntimeRedisClient: () => ({
    del: async (key: string) => store.delete(key),
    get: async (key: string) => store.get(key) ?? null,
    set: async (key: string, value: string) => store.set(key, value),
  }),
}));

const { isSoloBotChat } = await import('./chatComposition');

const makeApi = (getChatInfo: ReturnType<typeof vi.fn>) => ({ getChatInfo }) as any;

describe('isSoloBotChat', () => {
  beforeEach(() => store.clear());

  it('treats one user + one bot as the bot private conversation', async () => {
    // Feishu reports both counts as strings.
    const getChatInfo = vi.fn().mockResolvedValue({ bot_count: '1', user_count: '1' });

    await expect(isSoloBotChat(makeApi(getChatInfo), 'cli_app', 'oc_1')).resolves.toBe(true);
  });

  it('requires an @mention once a second human is a MEMBER, even if they never spoke', async () => {
    // The regression: the old speaker-count heuristic read this group as
    // private because only one of the two members had ever talked.
    const getChatInfo = vi.fn().mockResolvedValue({ bot_count: '1', user_count: '2' });

    await expect(isSoloBotChat(makeApi(getChatInfo), 'cli_app', 'oc_1')).resolves.toBe(false);
  });

  it('requires an @mention when another bot is in the chat', async () => {
    // One human, two bots — a message @-ing the other bot must not wake this one.
    const getChatInfo = vi.fn().mockResolvedValue({ bot_count: '2', user_count: '1' });

    await expect(isSoloBotChat(makeApi(getChatInfo), 'cli_app', 'oc_1')).resolves.toBe(false);
  });

  it('fails closed when the chat cannot be inspected', async () => {
    // e.g. the app lacks `im:chat:readonly`. Staying quiet beats talking over a group.
    const getChatInfo = vi.fn().mockRejectedValue(new Error('230027 Permission denied'));

    await expect(isSoloBotChat(makeApi(getChatInfo), 'cli_app', 'oc_1')).resolves.toBe(false);
  });

  it('caches the verdict instead of asking once per inbound message', async () => {
    const getChatInfo = vi.fn().mockResolvedValue({ bot_count: '1', user_count: '1' });
    const api = makeApi(getChatInfo);

    await isSoloBotChat(api, 'cli_app', 'oc_1');
    await isSoloBotChat(api, 'cli_app', 'oc_1');

    expect(getChatInfo).toHaveBeenCalledTimes(1);
  });

  it('keys the cache per chat, so one group does not answer for another', async () => {
    const getChatInfo = vi
      .fn()
      .mockResolvedValueOnce({ bot_count: '1', user_count: '1' })
      .mockResolvedValueOnce({ bot_count: '1', user_count: '5' });
    const api = makeApi(getChatInfo);

    await expect(isSoloBotChat(api, 'cli_app', 'oc_solo')).resolves.toBe(true);
    await expect(isSoloBotChat(api, 'cli_app', 'oc_team')).resolves.toBe(false);
  });
});
