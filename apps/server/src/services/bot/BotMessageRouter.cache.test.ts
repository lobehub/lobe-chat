import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BotMessageRouter } from './BotMessageRouter';

// ==================== Hoisted mocks ====================

const mockFindEnabledByPlatform = vi.hoisted(() => vi.fn());
const mockInitWithEnvKey = vi.hoisted(() => vi.fn());
const mockGetServerDB = vi.hoisted(() => vi.fn());
const mockProviderFindById = vi.hoisted(() => vi.fn());
const mockProviderUpdate = vi.hoisted(() => vi.fn());
const mockPeekPairingRequest = vi.hoisted(() => vi.fn());
const mockDeletePairingRequest = vi.hoisted(() => vi.fn());
const mockReleasePairingClaim = vi.hoisted(() => vi.fn());
const mockCreateOrGetPairingRequest = vi.hoisted(() => vi.fn());
const mockGetAgentRuntimeRedisClient = vi.hoisted(() => vi.fn().mockReturnValue(null));
const mockGetBotFeatureAccessState = vi.hoisted(() => vi.fn());

vi.mock('@/database/core/db-adaptor', () => ({
  getServerDB: mockGetServerDB,
}));

vi.mock('@/database/models/agentBotProvider', () => {
  const ctor = vi.fn().mockImplementation(function () {
    return {
      findById: mockProviderFindById,
      update: mockProviderUpdate,
    };
  });
  // Preserve the static method other tests rely on (load path).
  (
    ctor as unknown as { findEnabledByPlatform: typeof mockFindEnabledByPlatform }
  ).findEnabledByPlatform = mockFindEnabledByPlatform;
  Object.assign(ctor, {
    findEnabledByPlatformAndAppId: async (
      db: unknown,
      platform: string,
      appId: string,
      key: unknown,
    ) =>
      (await mockFindEnabledByPlatform(db, platform, key)).find(
        (p: any) => p.applicationId === appId,
      ),
  });
  return { AgentBotProviderModel: ctor };
});

vi.mock('./dmPairingStore', () => ({
  consumePairingRequest: vi.fn(),
  createOrGetPairingRequest: mockCreateOrGetPairingRequest,
  deletePairingRequest: mockDeletePairingRequest,
  peekPairingRequest: mockPeekPairingRequest,
  releasePairingClaim: mockReleasePairingClaim,
}));

vi.mock('@/server/modules/KeyVaultsEncrypt', () => ({
  KeyVaultsGateKeeper: {
    initWithEnvKey: mockInitWithEnvKey,
  },
}));

vi.mock('@/server/modules/AgentRuntime/redis', () => ({
  getAgentRuntimeRedisClient: mockGetAgentRuntimeRedisClient,
}));

vi.mock('@/business/server/bot/featureAccess', () => ({
  getBotFeatureAccessState: mockGetBotFeatureAccessState,
}));

// Stub appEnv so accessing `appEnv.APP_URL` in vitest doesn't trip
// `@t3-oss/env-nextjs`'s client-side access guard.
vi.mock('@/envs/app', () => ({
  appEnv: {
    APP_URL: 'http://localhost:3010',
  },
}));

vi.mock('@chat-adapter/state-ioredis', () => ({
  createIoRedisState: vi.fn(),
}));

// Mock Chat SDK
const mockInitialize = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockOnNewMention = vi.hoisted(() => vi.fn());
const mockOnSubscribedMessage = vi.hoisted(() => vi.fn());
const mockOnNewMessage = vi.hoisted(() => vi.fn());
const mockOnSlashCommand = vi.hoisted(() => vi.fn());
const mockWebhookHandler = vi.hoisted(() =>
  vi.fn().mockResolvedValue(new Response('OK', { status: 200 })),
);
// Default state mocks for the participant tracking. Tests that
// care about the multi-human transition reassign `mockGetList` to seed the
// pre-existing participant list.
const mockGetList = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const mockAppendToList = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockStateSetIfNotExists = vi.hoisted(() => vi.fn().mockResolvedValue(true));
const mockDispatchToHandlers = vi.hoisted(() => vi.fn());
const mockProcessMessage = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockDrainDeferredBotMessages = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const mockBuildReplayMessages = vi.hoisted(() => vi.fn());

vi.mock('chat', () => ({
  BaseFormatConverter: class {},
  Chat: vi.fn().mockImplementation(function () {
    return {
      dispatchToHandlers: mockDispatchToHandlers,
      getState: vi.fn(() => ({
        appendToList: mockAppendToList,
        getList: mockGetList,
        setIfNotExists: mockStateSetIfNotExists,
      })),
      initialize: mockInitialize,
      onNewMention: mockOnNewMention,
      onNewMessage: mockOnNewMessage,
      onSlashCommand: mockOnSlashCommand,
      onSubscribedMessage: mockOnSubscribedMessage,
      processMessage: mockProcessMessage,
      webhooks: mockChatWebhooks,
    };
  }),
  ConsoleLogger: vi.fn(),
}));

vi.mock('./deferredMessages', () => ({
  replayDeferredBotMessages: async (
    app: string,
    thread: string,
    replay: (entries: unknown[]) => Promise<void>,
  ) => {
    const entries = await mockDrainDeferredBotMessages(app, thread);
    if (entries.length) await replay(entries);
  },
}));

vi.mock('./mergeMessages', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return { ...actual, buildReplayMessages: mockBuildReplayMessages };
});

vi.mock('@/server/services/aiAgent', () => ({
  AiAgentService: vi.fn().mockImplementation(function () {
    return {
      interruptTask: vi.fn().mockResolvedValue({ success: true }),
    };
  }),
}));

const mockHandleMention = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockHandleSubscribedMessage = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockAgentBridgeServiceCtor = vi.hoisted(() => vi.fn());
// Default to "platform does not opt into thread isolation" so existing tests
// keep their pre-behaviour. Individual tests can replace this via
// `.mockResolvedValueOnce(...)` to simulate Discord's auto-thread upgrade.
const mockOpenThreadForChannelWake = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
// Mirrors Discord's `ensureThreadMember`: pulls a platform user into the
// reply thread so they get notified. Optional on the PlatformClient
// contract — tests that care assert on it; others ignore the extra call.
const mockEnsureThreadMember = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('./AgentBridgeService', () => ({
  AgentBridgeService: mockAgentBridgeServiceCtor,
}));

// Mock platform entries
const mockCreateAdapter = vi.hoisted(() =>
  vi.fn().mockReturnValue({ testplatform: { type: 'mock-adapter' } }),
);
const mockReconcileWebhook = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
/** Per-platform webhook handlers exposed by the mocked Chat instance (`chat.webhooks`). */
const mockChatWebhooks = vi.hoisted(
  () =>
    ({ discord: mockWebhookHandler }) as Record<
      string,
      (req: Request, options?: any) => Promise<Response>
    >,
);
const mockGetPlatform = vi.hoisted(() =>
  vi.fn().mockImplementation(function (platform: string) {
    if (platform === 'unknown') return undefined;
    return {
      schema: [],
      clientFactory: {
        createClient: vi.fn().mockReturnValue({
          applicationId: 'mock-app',
          createAdapter: mockCreateAdapter,
          reconcileWebhook: mockReconcileWebhook,
          extractAuthorLocale: (msg: any) => msg?.raw?.from?.language_code,
          // Match the per-platform contract: return the most-specific raw
          // ID (last segment of the composite). Telegram `discord:chat-1`
          // → `chat-1`; Discord `discord:guild:channel:thread` → `thread`.
          extractChatId: (id: string) => id.split(':').at(-1) ?? '',
          // Mirrors Discord's `extraGroupAllowlistChannels`: when the
          // platformThreadId has a thread segment, surface the parent
          // channel as an extra allowlist candidate. Two-segment IDs
          // (Telegram-style `discord:chat-1`) return [], leaving
          // existing tests unaffected.
          extraGroupAllowlistChannels: (threadId: string) => {
            const parts = threadId.split(':');
            return parts.length === 4 && parts[2] ? [parts[2]] : [];
          },
          ensureThreadMember: mockEnsureThreadMember,
          getMessenger: () => ({
            createMessage: vi.fn(),
            editMessage: vi.fn(),
            removeReaction: vi.fn(),
            triggerTyping: vi.fn(),
          }),
          id: platform,
          openThreadForChannelWake: mockOpenThreadForChannelWake,
          parseMessageId: (id: string) => id,
          start: vi.fn(),
          stop: vi.fn(),
        }),
      },
      credentials: [],
      id: platform,
      name: platform,
    };
  }),
);

// Mirrors the real `parseIdList` in ../platforms/const.ts: accepts the new
// `[{ id, name? }]` shape plus the legacy string / string[] shapes that
// existing data on disk may still be in.
vi.mock('./platforms', async () => ({
  ...(await vi.importActual('./platforms/const')),
  ...(await vi.importActual('./platforms/utils')),
  platformRegistry: { getPlatform: mockGetPlatform },
}));

// ==================== Helpers ====================

const FAKE_DB = {} as any;
const FAKE_GATEKEEPER = { decrypt: vi.fn() };

function makeProvider(overrides: Record<string, any> = {}) {
  return {
    agentId: 'agent-1',
    applicationId: 'app-123',
    credentials: { botToken: 'token' },
    userId: 'user-1',
    ...overrides,
  };
}

// ==================== Tests ====================

describe('BotMessageRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerDB.mockResolvedValue(FAKE_DB);
    mockInitWithEnvKey.mockResolvedValue(FAKE_GATEKEEPER);
    mockFindEnabledByPlatform.mockResolvedValue([]);
    mockHandleMention.mockResolvedValue(undefined);
    mockHandleSubscribedMessage.mockResolvedValue(undefined);
    mockAgentBridgeServiceCtor.mockImplementation(function () {
      return {
        handleMention: mockHandleMention,
        handleSubscribedMessage: mockHandleSubscribedMessage,
      };
    });
    mockOpenThreadForChannelWake.mockResolvedValue(undefined);
    // participant tracking — restore defaults wiped by
    // clearAllMocks. Empty list = fresh single-human thread; individual
    // describes / tests override as needed.
    mockGetList.mockResolvedValue([]);
    mockAppendToList.mockResolvedValue(undefined);
    mockStateSetIfNotExists.mockResolvedValue(true);
    // Reset pairing-store + provider-model mocks to safe defaults so a
    // previous test's stub doesn't leak into the next one.
    mockPeekPairingRequest.mockResolvedValue(null);
    mockDeletePairingRequest.mockResolvedValue(undefined);
    mockReleasePairingClaim.mockResolvedValue(undefined);
    mockCreateOrGetPairingRequest.mockResolvedValue({ status: 'redis-unavailable' });
    mockProviderFindById.mockResolvedValue(undefined);
    mockProviderUpdate.mockResolvedValue(undefined);
    mockGetAgentRuntimeRedisClient.mockReturnValue(null);
    mockGetBotFeatureAccessState.mockResolvedValue({ allowed: true });
    mockChatWebhooks.discord = mockWebhookHandler;
  });

  it('reloads another instance after a parent channel is allowed', async () => {
    const a = new BotMessageRouter();
    const b = new BotMessageRouter();
    const request = () =>
      new Request('https://example.com/webhook', { body: '{}', method: 'POST' });
    const provider = (channels: string[]) =>
      makeProvider({
        applicationId: 'app-1',
        settings: { groupPolicy: 'allowlist', groupAllowFrom: channels },
      });
    mockFindEnabledByPlatform.mockResolvedValue([provider(['old-channel'])]);
    await a.getWebhookHandler('discord', 'app-1')(request());
    await b.getWebhookHandler('discord', 'app-1')(request());

    mockFindEnabledByPlatform.mockResolvedValue([provider(['old-channel', 'bot-testing'])]);
    await a.invalidateBot('discord', 'app-1');
    await b.getWebhookHandler('discord', 'app-1')(request());
    const thread = (id: string) => ({
      id: `discord:guild:bot-testing:${id}`,
      channelId: id,
      isDM: false,
      post: vi.fn().mockResolvedValue(undefined),
      setState: vi.fn().mockResolvedValue(undefined),
    });
    const message = {
      author: { isBot: false, userId: 'alice', userName: 'alice' },
      isMention: true,
      text: 'query wiki',
    };
    const firstThread = thread('new-thread-1');
    await mockOnNewMention.mock.calls.at(-1)![0](firstThread, message);
    expect(firstThread.post).not.toHaveBeenCalled();
    expect(mockHandleMention).toHaveBeenCalledTimes(1);
    await b.getWebhookHandler('discord', 'app-1')(request());
    const freshHandler = mockOnNewMention.mock.calls.at(-1)![0];
    for (const id of ['new-thread-1', 'new-thread-2']) {
      const allowed = thread(id);
      await freshHandler(allowed, message);
      expect(allowed.post).not.toHaveBeenCalled();
    }
    expect(mockHandleMention).toHaveBeenCalledTimes(3);
  });

  it('revokes access in another instance and keeps sibling channels blocked', async () => {
    const a = new BotMessageRouter();
    const b = new BotMessageRouter();
    const req = () => new Request('https://example.com/webhook', { method: 'POST' });
    const setChannels = (ids: string[]) =>
      mockFindEnabledByPlatform.mockResolvedValue([
        makeProvider({
          applicationId: 'app-1',
          settings: { groupPolicy: 'allowlist', groupAllowFrom: ids },
        }),
      ]);
    const mention = async (parent: string, threadId: string) => {
      await b.getWebhookHandler('discord', 'app-1')(req());
      const thread = {
        id: `discord:guild:${parent}:${threadId}`,
        isDM: false,
        post: vi.fn(),
        setState: vi.fn(),
      };
      await mockOnNewMention.mock.calls.at(-1)![0](thread, {
        author: { userId: 'alice', userName: 'alice', isBot: false },
        isMention: true,
        text: 'wiki question',
      });
      return thread;
    };
    setChannels(['bot-testing']);
    await a.getWebhookHandler('discord', 'app-1')(req());
    await mention('bot-testing', 'first');
    expect(mockHandleMention).toHaveBeenCalledTimes(1);
    expect((await mention('sibling', 'second')).post).toHaveBeenCalled();
    setChannels([]);
    await a.invalidateBot('discord', 'app-1');
    expect((await mention('bot-testing', 'third')).post).toHaveBeenCalled();
    expect(mockHandleMention).toHaveBeenCalledTimes(1);
  });

  it.each(['disabled', 'database unavailable'])(
    'does not dispatch a cached bot when %s',
    async (state) => {
      const router = new BotMessageRouter();
      const handler = router.getWebhookHandler('discord', 'app-1');
      const req = () => new Request('https://example.com/webhook', { method: 'POST' });
      mockFindEnabledByPlatform.mockResolvedValue([makeProvider({ applicationId: 'app-1' })]);
      await handler(req());
      mockWebhookHandler.mockClear();
      if (state === 'disabled') mockFindEnabledByPlatform.mockResolvedValue([]);
      else mockFindEnabledByPlatform.mockRejectedValue(new Error('DB unavailable'));
      expect((await handler(req())).status).toBe(404);
      expect(mockWebhookHandler).not.toHaveBeenCalled();
    },
  );

  it('reuses unchanged configuration despite activity timestamp updates', async () => {
    const router = new BotMessageRouter();
    const handler = router.getWebhookHandler('discord', 'app-1');
    for (const accessedAt of [new Date(0), new Date(1000)]) {
      mockFindEnabledByPlatform.mockResolvedValue([
        makeProvider({ applicationId: 'app-1', accessedAt }),
      ]);
      await handler(new Request('https://example.com/webhook', { method: 'POST' }));
    }
    expect(mockInitialize).toHaveBeenCalledTimes(1);
  });
});
