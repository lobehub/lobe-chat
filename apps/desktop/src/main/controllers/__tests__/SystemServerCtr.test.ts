import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { App } from '@/core/App';

import SystemServerCtr from '../SystemServerCtr';

vi.mock('@/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  }),
}));

vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock('@/const/dir', () => ({
  DB_SCHEMA_HASH_FILENAME: 'db-schema-hash.txt',
  LOCAL_DATABASE_DIR: 'database',
  userDataDir: '/mock/user/data',
}));

const mockApp = {
  appStoragePath: '/mock/storage',
} as unknown as App;

describe('SystemServerCtr', () => {
  let controller: SystemServerCtr;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new SystemServerCtr(mockApp);
  });

  it('returns database path', async () => {
    await expect(controller.getDatabasePath()).resolves.toBe('/mock/storage/database');
  });

  it('reads schema hash when file exists', async () => {
    const { readFileSync } = await import('node:fs');
    vi.mocked(readFileSync).mockReturnValue('hash123');

    await expect(controller.getDatabaseSchemaHash()).resolves.toBe('hash123');
    expect(readFileSync).toHaveBeenCalledWith('/mock/storage/db-schema-hash.txt', 'utf8');
  });

  it('returns undefined when schema hash file missing', async () => {
    const { readFileSync } = await import('node:fs');
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error('missing');
    });

    await expect(controller.getDatabaseSchemaHash()).resolves.toBeUndefined();
  });

  it('returns user data path', async () => {
    await expect(controller.getUserDataPath()).resolves.toBe('/mock/user/data');
  });

  it('writes schema hash to disk', async () => {
    const { writeFileSync } = await import('node:fs');

    await controller.setDatabaseSchemaHash('newhash');

    expect(writeFileSync).toHaveBeenCalledWith(
      '/mock/storage/db-schema-hash.txt',
      'newhash',
      'utf8',
    );
  });
});
