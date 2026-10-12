// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deviceRouter } from '../device';

const mocks = vi.hoisted(() => ({
  browseDirectory: vi.fn(),
  createTerminalSession: vi.fn(),
  findWorkspaceDeviceById: vi.fn(),
}));

vi.mock('@/database/core/db-adaptor', () => ({ getServerDB: vi.fn() }));
vi.mock('@/database/models/device', () => ({
  DeviceModel: class {
    findWorkspaceDeviceById = mocks.findWorkspaceDeviceById;
  },
}));
vi.mock('@/server/services/deviceGateway', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  deviceGateway: {
    browseDirectory: mocks.browseDirectory,
    createTerminalSession: mocks.createTerminalSession,
  },
}));

type Role = 'member' | 'owner' | 'viewer';

const workspaceCaller = (userId: string, workspaceRole: Role) =>
  deviceRouter.createCaller({ userId, workspaceId: 'workspace', workspaceRole } as never);

const withDevice = (visibility: 'private' | 'public') =>
  mocks.findWorkspaceDeviceById.mockResolvedValue({
    deviceId: 'device',
    userId: 'enroller',
    visibility,
  });

const operate = {
  browseDirectory: (userId: string, role: Role) =>
    workspaceCaller(userId, role).browseDirectory({ deviceId: 'device', path: '/home' }),
  createTerminalSession: (userId: string, role: Role) =>
    workspaceCaller(userId, role).createTerminalSession({ cols: 80, deviceId: 'device', rows: 24 }),
};

describe('operating a workspace device', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.browseDirectory.mockResolvedValue({ entries: [] });
    mocks.createTerminalSession.mockResolvedValue({ sessionId: 'session' });
  });

  it.each(Object.keys(operate) as (keyof typeof operate)[])(
    'lets any member %s on a public device',
    async (procedure) => {
      withDevice('public');
      await expect(operate[procedure]('member', 'member')).resolves.toBeTruthy();
      expect(mocks[procedure]).toHaveBeenCalledWith(
        expect.objectContaining({ deviceId: 'device', userId: 'member', workspaceId: 'workspace' }),
      );
    },
  );

  it.each(Object.keys(operate) as (keyof typeof operate)[])(
    "rejects %s from a member on someone else's private device",
    async (procedure) => {
      withDevice('private');
      await expect(operate[procedure]('member', 'member')).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
      expect(mocks[procedure]).not.toHaveBeenCalled();
    },
  );

  it.each(Object.keys(operate) as (keyof typeof operate)[])(
    'rejects %s from a read-only viewer even on a public device',
    async (procedure) => {
      withDevice('public');
      await expect(operate[procedure]('viewer', 'viewer')).rejects.toMatchObject({
        code: 'FORBIDDEN',
        message: expect.stringContaining('Workspace viewers cannot'),
      });
      expect(mocks[procedure]).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['enroller', 'member'],
    ['owner', 'owner'],
  ] as const)('lets the %s browse a private device', async (userId, role) => {
    withDevice('private');
    await expect(operate.browseDirectory(userId, role)).resolves.toEqual({ entries: [] });
  });

  it('keeps hiding devices the caller cannot see', async () => {
    mocks.findWorkspaceDeviceById.mockResolvedValue(undefined);
    await expect(operate.browseDirectory('member', 'member')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    expect(mocks.browseDirectory).not.toHaveBeenCalled();
  });
});
