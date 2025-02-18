import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clientDB, initializeDB } from '@/database/client/db';
import { installedPlugins, users } from '@/database/schemas';
import { LobeTool } from '@/types/tool';
import { LobeToolCustomPlugin } from '@/types/tool/plugin';

import { ClientService } from './client';
import { InstallPluginParams } from './type';

// Mocking modules and functions

const userId = 'message-db';
const pluginService = new ClientService(userId);

// Mock data
beforeEach(async () => {
  await initializeDB();

  // 在每个测试用例之前，重置表数据
  await clientDB.transaction(async (trx) => {
    await trx.delete(users);
    await trx.insert(users).values([{ id: userId }, { id: '456' }]);
  });
});

describe('PluginService', () => {
  describe('installPlugin', () => {
    it('should install a plugin', async () => {
      // Arrange
      const fakePlugin = {
        identifier: 'test-plugin-d',
        manifest: { name: 'TestPlugin', version: '1.0.0' } as unknown as LobeChatPluginManifest,
        type: 'plugin',
      } as InstallPluginParams;

      // Act
      await pluginService.installPlugin(fakePlugin);

      // Assert
      const result = await clientDB.query.installedPlugins.findFirst({
        where: eq(installedPlugins.identifier, fakePlugin.identifier),
      });
      expect(result).toMatchObject(fakePlugin);
    });
  });

  describe('getInstalledPlugins', () => {
    it('should return a list of installed plugins', async () => {
      // Arrange
      const fakePlugins = [{ identifier: 'test-plugin', type: 'plugin' }] as LobeTool[];
      await clientDB
        .insert(installedPlugins)
        .values([{ identifier: 'test-plugin', type: 'plugin', userId }]);
      // Act
      const data = await pluginService.getInstalledPlugins();

      // Assert
      expect(data).toMatchObject(fakePlugins);
    });
  });

  describe('uninstallPlugin', () => {
    it('should uninstall a plugin', async () => {
      // Arrange
      const identifier = 'test-plugin';
      await clientDB.insert(installedPlugins).values([{ identifier, type: 'plugin', userId }]);

      // Act
      await pluginService.uninstallPlugin(identifier);

      // Assert
      const result = await clientDB.query.installedPlugins.findFirst({
        where: eq(installedPlugins.identifier, identifier),
      });
      expect(result).toBe(undefined);
    });
  });

  describe('createCustomPlugin', () => {
    it('should create a custom plugin', async () => {
      // Arrange
      const customPlugin = {
        identifier: 'custom-plugin-x',
        manifest: {},
        type: 'customPlugin',
      } as LobeToolCustomPlugin;

      // Act
      await pluginService.createCustomPlugin(customPlugin);

      // Assert
      const result = await clientDB.query.installedPlugins.findFirst({
        where: eq(installedPlugins.identifier, customPlugin.identifier),
      });
      expect(result).toMatchObject(customPlugin);
    });
  });

  describe('updatePlugin', () => {
    it('should update a plugin', async () => {
      // Arrange
      const identifier = 'plugin-id';
      const value = { customParams: { ab: '1' } } as unknown as LobeToolCustomPlugin;
      await clientDB.insert(installedPlugins).values([{ identifier, type: 'plugin', userId }]);

      // Act
      await pluginService.updatePlugin(identifier, value);

      // Assert
      const result = await clientDB.query.installedPlugins.findFirst({
        where: eq(installedPlugins.identifier, identifier),
      });
      expect(result).toMatchObject(value);
    });
  });

  describe('updatePluginManifest', () => {
    it('should update a plugin manifest', async () => {
      // Arrange
      const identifier = 'plugin-id';
      const manifest = { name: 'NewPluginManifest' } as unknown as LobeChatPluginManifest;
      await clientDB.insert(installedPlugins).values([{ identifier, type: 'plugin', userId }]);

      // Act
      await pluginService.updatePluginManifest(identifier, manifest);

      // Assert
      const result = await clientDB.query.installedPlugins.findFirst({
        where: eq(installedPlugins.identifier, identifier),
      });
      expect(result).toMatchObject({ manifest });
    });
  });

  describe('removeAllPlugins', () => {
    it('should remove all plugins', async () => {
      // Arrange
      await clientDB.insert(installedPlugins).values([
        { identifier: '123', type: 'plugin', userId },
        { identifier: '234', type: 'plugin', userId },
      ]);

      // Act
      await pluginService.removeAllPlugins();

      // Assert
      const result = await clientDB.query.installedPlugins.findMany({
        where: eq(installedPlugins.userId, userId),
      });
      expect(result.length).toEqual(0);
    });
  });

  describe('updatePluginSettings', () => {
    it('should update plugin settings', async () => {
      // Arrange
      const id = 'plugin-id';
      const settings = { color: 'blue' };
      await clientDB.insert(installedPlugins).values([{ identifier: id, type: 'plugin', userId }]);

      // Act
      await pluginService.updatePluginSettings(id, settings);

      // Assert
      const result = await clientDB.query.installedPlugins.findFirst({
        where: eq(installedPlugins.identifier, id),
      });

      expect(result).toMatchObject({ settings });
    });
  });
});
