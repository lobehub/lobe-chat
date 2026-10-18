// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createCallerFactory } from '@/libs/trpc/lambda';
import { createContextInner } from '@/libs/trpc/lambda/context';

import { messengerRouter } from './index';

const {
  mockDeleteByPlatform,
  mockDisconnectUserMessenger,
  mockFindFileById,
  mockGetBotRuntimeStatus,
  mockGetFileAccessUrl,
  mockGetServerDB,
  mockListAccountLinks,
  mockListByInstallerUserId,
  mockSendMessengerPush,
  mockSlackAuthTest,
} = vi.hoisted(() => ({
  mockDeleteByPlatform: vi.fn(),
  mockDisconnectUserMessenger: vi.fn(),
  mockFindFileById: vi.fn(),
  mockGetBotRuntimeStatus: vi.fn(),
  mockGetFileAccessUrl: vi.fn(),
  mockGetServerDB: vi.fn(),
  mockListAccountLinks: vi.fn(),
  mockListByInstallerUserId: vi.fn(),
  mockSendMessengerPush: vi.fn(),
  mockSlackAuthTest: vi.fn(),
}));

vi.mock('@lobechat/chat-adapter-wechat', () => ({
  fetchQrCode: vi.fn(),
  getWechatTextSendCount: () => 1,
  pollQrStatus: vi.fn(),
}));
vi.mock('@/config/messenger', () => ({
  getEnabledMessengerPlatforms: vi.fn().mockResolvedValue([]),
  getMessengerDiscordConfig: vi.fn(),
  getMessengerSlackConfig: vi.fn(),
  getMessengerTelegramConfig: vi.fn(),
  isMessengerPlatformEnabled: vi.fn().mockResolvedValue(true),
}));
vi.mock('@/database/core/db-adaptor', () => ({ getServerDB: mockGetServerDB }));
vi.mock('@/database/models/messengerInstallation', () => ({
  MessengerInstallationModel: {
    findById: vi.fn(),
    listByInstallerUserId: mockListByInstallerUserId,
    markRevoked: vi.fn(),
  },
}));
vi.mock('@/database/models/messengerAccountLink', () => ({
  MessengerAccountLinkConflictError: class extends Error {},
  MessengerAccountLinkRelinkRequiredError: class extends Error {},
  MessengerAccountLinkModel: class {
    deleteByPlatform = mockDeleteByPlatform;
    list = mockListAccountLinks;
  },
}));
vi.mock('@/server/modules/KeyVaultsEncrypt', () => ({
  KeyVaultsGateKeeper: { initWithEnvKey: vi.fn().mockResolvedValue({ kind: 'gatekeeper' }) },
}));
vi.mock('@/server/modules/AgentRuntime/redis', () => ({
  getAgentRuntimeRedisClient: () => null,
}));
vi.mock('@/server/services/messenger', () => ({
  getMessengerRouter: () => ({ invalidateBot: vi.fn() }),
  messengerPlatformRegistry: { listSerializedPlatforms: vi.fn().mockReturnValue([]) },
}));
vi.mock('@/server/services/gateway', () => ({
  GatewayService: class {
    disconnectUserMessenger = mockDisconnectUserMessenger;
  },
}));
vi.mock('@/server/services/gateway/runtimeStatus', () => ({
  getBotRuntimeStatus: mockGetBotRuntimeStatus,
}));
vi.mock('@/server/services/messenger/installations', () => ({
  wechatInstallationKey: (tenantId: string) => `wechat:${tenantId}`,
}));
vi.mock('@/server/services/bot/platforms/slack/api', () => ({
  SlackApi: vi.fn().mockImplementation(function () {
    return { authTest: mockSlackAuthTest };
  }),
}));
vi.mock('@/database/models/file', () => ({
  FileModel: class {
    findById = mockFindFileById;
  },
}));
vi.mock('@/server/services/file', () => ({
  FileService: class {
    getFileAccessUrl = mockGetFileAccessUrl;
  },
}));
vi.mock('@/server/services/messenger/push', () => ({
  getMessengerPushWindow: vi.fn(),
  MESSENGER_PUSH_PLATFORMS: ['telegram', 'slack', 'discord', 'wechat'],
  sendMessengerPush: mockSendMessengerPush,
}));

const createCaller = createCallerFactory(messengerRouter);
const caller = async () => createCaller(await createContextInner({ userId: 'user-1' }));

/** The router fan-outs cap concurrent per-item I/O at this many calls. */
const CAP = 5;

/**
 * Wraps an async implementation so it records the peak number of overlapping
 * calls. Each call yields across a few macrotasks so unbounded fan-outs overlap.
 */
const trackInFlight = <A extends unknown[], R>(impl: (...args: A) => R) => {
  const state = { inFlight: 0, peak: 0 };
  const fn = async (...args: A) => {
    state.inFlight += 1;
    state.peak = Math.max(state.peak, state.inFlight);
    await new Promise((resolve) => setTimeout(resolve, 1));
    state.inFlight -= 1;
    return impl(...args);
  };
  return { fn, state };
};

const wechatLink = (i: number) => ({
  activeAgentId: null,
  applicationId: `wechat-bot-${i}`,
  createdAt: new Date('2026-07-17T00:00:00.000Z'),
  id: `wechat-link-${i}`,
  platform: 'wechat',
  platformUserId: `wechat-user-${i}`,
  tenantId: `wechat-user-${i}`,
  userId: 'user-1',
  workspaceId: null,
});

const slackInstall = (i: number) => ({
  applicationId: `A_${i}`,
  createdAt: new Date('2026-05-06T00:00:00.000Z'),
  credentials: { botToken: `xoxb-${i}` },
  id: `install-${i}`,
  installedByUserId: 'user-1',
  metadata: { scope: 'chat:write', tenantName: `Team ${i}` },
  platform: 'slack',
  tenantId: `T_${i}`,
});

const COUNT = 12;
const range = Array.from({ length: COUNT }, (_, i) => i);

describe('messenger router fan-outs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerDB.mockResolvedValue({ kind: 'server-db' });
    mockListAccountLinks.mockResolvedValue([]);
    mockListByInstallerUserId.mockResolvedValue([]);
  });

  it('listMyInstallations bounds Slack reconciles and keeps their order', async () => {
    const tracker = trackInFlight(() => ({ ok: true }));
    mockSlackAuthTest.mockImplementation(tracker.fn);
    mockListByInstallerUserId.mockResolvedValue(range.map(slackInstall));

    const result = await (await caller()).listMyInstallations();

    expect(result.map((view) => view.id)).toEqual(range.map((i) => `install-${i}`));
    expect(mockSlackAuthTest).toHaveBeenCalledTimes(COUNT);
    expect(tracker.state.peak).toBeGreaterThan(1);
    expect(tracker.state.peak).toBeLessThanOrEqual(CAP);
  });

  it('listMyInstallations bounds WeChat runtime lookups and keeps their order', async () => {
    const tracker = trackInFlight((_platform: string, applicationId: string) => ({
      applicationId,
      status: 'connected',
    }));
    mockGetBotRuntimeStatus.mockImplementation(tracker.fn);
    mockListAccountLinks.mockResolvedValue(range.map(wechatLink));

    const result = await (await caller()).listMyInstallations();

    expect(result.map((view) => [view.id, view.runtime])).toEqual(
      range.map((i) => [
        `wechat-link-${i}`,
        { applicationId: `wechat-bot-${i}`, status: 'connected' },
      ]),
    );
    expect(tracker.state.peak).toBeGreaterThan(1);
    expect(tracker.state.peak).toBeLessThanOrEqual(CAP);
  });

  it('unlink bounds WeChat disconnects and disconnects every link', async () => {
    const tracker = trackInFlight(() => undefined);
    mockDisconnectUserMessenger.mockImplementation(tracker.fn);
    mockListAccountLinks.mockResolvedValue(range.map(wechatLink));

    await expect((await caller()).unlink({ platform: 'wechat' })).resolves.toEqual({
      success: true,
    });

    expect(mockDeleteByPlatform).toHaveBeenCalledWith('wechat', undefined);
    expect(mockDisconnectUserMessenger.mock.calls.map(([arg]) => arg.installationKey)).toEqual(
      range.map((i) => `wechat:wechat-user-${i}`),
    );
    expect(tracker.state.peak).toBeGreaterThan(1);
    expect(tracker.state.peak).toBeLessThanOrEqual(CAP);
  });

  it('sendMessengerPush bounds attachment resolution and keeps attachment order', async () => {
    const attachmentCount = 10;
    const tracker = trackInFlight((id: string) => ({
      fileType: 'image/png',
      id,
      name: `${id}.png`,
      size: 1,
      url: `s3://bucket/${id}.png`,
    }));
    mockFindFileById.mockImplementation(tracker.fn);
    mockGetFileAccessUrl.mockImplementation(async ({ id }: { id: string }) => `https://f/${id}`);
    mockSendMessengerPush.mockResolvedValue({ status: 'sent' });

    await (
      await caller()
    ).sendMessengerPush({
      attachments: Array.from({ length: attachmentCount }, (_, i) => ({
        fileId: `file-${i}`,
        type: 'image' as const,
      })),
      platform: 'telegram',
    });

    const [{ attachments }] = mockSendMessengerPush.mock.calls[0];
    expect(attachments.map((a: { fetchUrl: string }) => a.fetchUrl)).toEqual(
      Array.from({ length: attachmentCount }, (_, i) => `https://f/file-${i}`),
    );
    expect(tracker.state.peak).toBeGreaterThan(1);
    expect(tracker.state.peak).toBeLessThanOrEqual(CAP);
  });
});
