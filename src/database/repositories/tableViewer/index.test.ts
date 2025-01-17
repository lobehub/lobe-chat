import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clientDB, initializeDB } from '@/database/client/db';

import { TableViewerRepo } from './index';

const userId = 'plugin-db';
const repo = new TableViewerRepo(clientDB as any, userId);

beforeEach(async () => {
  await initializeDB();
});

describe('TableViewerRepo', () => {
  describe('getAllTables', () => {
    it('find all tables', async () => {
      const result = await repo.getAllTables();

      expect(result.length).toEqual(37);
      expect(result[0]).toEqual({ name: 'agents', type: 'BASE TABLE' });
    });
  });

  describe('getTableDetails', () => {
    it('should delete an installed plugin by identifier', async () => {
      // await clientDB.insert(installedPlugins).values({
      //   userId,
      //   type: 'plugin',
      //   identifier: 'test-plugin',
      //   manifest: { name: 'Test Plugin' },
      // } as unknown as NewInstalledPlugin);
      //
      // await pluginModel.delete('test-plugin');
      //
      // const result = await clientDB.select().from(installedPlugins);
      // expect(result).toHaveLength(0);
    });
  });
});
