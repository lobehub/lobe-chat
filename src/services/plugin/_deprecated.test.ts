import { LobeTool } from '@lobechat/types';
import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PluginModel } from '@/database/_deprecated/models/plugin';
import { DB_Plugin } from '@/database/_deprecated/schemas/plugin';
import { LobeToolCustomPlugin } from '@/types/tool/plugin';

import { ClientService } from './_deprecated';
import { InstallPluginParams } from './type';

const pluginService = new ClientService();

// Mocking modules and functions

vi.mock('@/database/_deprecated/models/plugin', () => ({
  PluginModel: {
    getList: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
    clear: vi.fn(),
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('PluginService', () => {
  describe('installPlugin', () => {
    it('should install a plugin', async () => {
      // Arrange
      const fakePlugin = {
        identifier: 'test-plugin',
        manifest: { name: 'TestPlugin', version: '1.0.0' } as unknown as LobeChatPluginManifest,
        type: 'plugin',
      } as InstallPluginParams;
      vi.mocked(PluginModel.create).mockResolvedValue(fakePlugin);

      // Act
      const installedPlugin = await pluginService.installPlugin(fakePlugin);

      // Assert
      expect(PluginModel.create).toHaveBeenCalledWith(fakePlugin);
      expect(installedPlugin).toEqual(fakePlugin);
    });
  });

  describe('getInstalledPlugins', () => {
    it('should return a list of installed plugins', async () => {
      // Arrange
      const fakePlugins = [{ identifier: 'test-plugin', type: 'plugin' }] as LobeTool[];
      vi.mocked(PluginModel.getList).mockResolvedValue(fakePlugins as DB_Plugin[]);

      // Act
      const installedPlugins = await pluginService.getInstalledPlugins();

      // Assert
      expect(PluginModel.getList).toHaveBeenCalled();
      expect(installedPlugins).toEqual(fakePlugins);
    });
  });

  describe('uninstallPlugin', () => {
    it('should uninstall a plugin', async () => {
      // Arrange
      const identifier = 'test-plugin';
      vi.mocked(PluginModel.delete).mockResolvedValue();

      // Act
      const result = await pluginService.uninstallPlugin(identifier);

      // Assert
      expect(PluginModel.delete).toHaveBeenCalledWith(identifier);
      expect(result).toBe(undefined);
    });
  });

  describe('createCustomPlugin', () => {
    it('should create a custom plugin', async () => {
      // Arrange
      const customPlugin = {
        identifier: 'custom-plugin',
        manifest: {},
        type: 'customPlugin',
      } as LobeToolCustomPlugin;
      vi.mocked(PluginModel.create).mockResolvedValue(customPlugin);

      // Act
      const result = await pluginService.createCustomPlugin(customPlugin);

      // Assert
      expect(PluginModel.create).toHaveBeenCalledWith({
        ...customPlugin,
        type: 'customPlugin',
      });
      expect(result).toEqual(customPlugin);
    });
  });

  describe('updatePlugin', () => {
    it('should update a plugin', async () => {
      // Arrange
      const id = 'plugin-id';
      const value = { settings: { ab: '1' } } as unknown as LobeToolCustomPlugin;
      vi.mocked(PluginModel.update).mockResolvedValue(1);

      // Act
      const result = await pluginService.updatePlugin(id, value);

      // Assert
      expect(PluginModel.update).toHaveBeenCalledWith(id, value);
      expect(result).toEqual(undefined);
    });
  });

  describe('updatePluginManifest', () => {
    it('should update a plugin manifest', async () => {
      // Arrange
      const id = 'plugin-id';
      const manifest = { name: 'NewPluginManifest' } as unknown as LobeChatPluginManifest;
      vi.mocked(PluginModel.update).mockResolvedValue(1);

      // Act
      const result = await pluginService.updatePluginManifest(id, manifest);

      // Assert
      expect(PluginModel.update).toHaveBeenCalledWith(id, { manifest });
      expect(result).toEqual(undefined);
    });
  });

  describe('removeAllPlugins', () => {
    it('should remove all plugins', async () => {
      // Arrange
      vi.mocked(PluginModel.clear).mockResolvedValue(undefined);

      // Act
      const result = await pluginService.removeAllPlugins();

      // Assert
      expect(PluginModel.clear).toHaveBeenCalled();
      expect(result).toBe(undefined);
    });
  });

  describe('updatePluginSettings', () => {
    it('should update plugin settings', async () => {
      // Arrange
      const id = 'plugin-id';
      const settings = { color: 'blue' };

      // Act
      const result = await pluginService.updatePluginSettings(id, settings);

      // Assert
      expect(PluginModel.update).toHaveBeenCalledWith(id, { settings });
      expect(result).toEqual(undefined);
    });
  });
});
