import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DB_Plugin } from '../../schemas/plugin';
import { PluginModel } from '../plugin';

describe('PluginModel', () => {
  let pluginData: DB_Plugin;

  beforeEach(() => {
    // 设置正确结构的插件数据
    pluginData = {
      identifier: 'test-plugin',
      id: 'test-plugin',
      manifest: {},
      type: 'plugin',
    };
  });

  afterEach(async () => {
    // 每次测试后清理数据库
    await PluginModel.clear();
  });

  describe('getList', () => {
    it('should fetch and return the plugin list', async () => {
      await PluginModel.create(pluginData);
      const plugins = await PluginModel.getList();
      expect(plugins).toHaveLength(1);
      expect(plugins[0]).toEqual(pluginData);
    });
  });

  describe('create', () => {
    it('should create a plugin record', async () => {
      await PluginModel.create(pluginData);
      const plugins = await PluginModel.getList();
      expect(plugins).toHaveLength(1);
      expect(plugins[0]).toEqual(pluginData);
    });
  });

  describe('batchCreate', () => {
    it('should batch create plugin records', async () => {
      await PluginModel.batchCreate([pluginData, { ...pluginData, identifier: 'abc' }]);
      const plugins = await PluginModel.getList();
      expect(plugins).toHaveLength(2);
    });
  });

  describe('delete', () => {
    it('should delete a plugin', async () => {
      await PluginModel.create(pluginData);
      await PluginModel.delete(pluginData.identifier);
      const plugins = await PluginModel.getList();
      expect(plugins).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update a plugin', async () => {
      await PluginModel.create(pluginData);
      const updatedPluginData: DB_Plugin = { ...pluginData, type: 'customPlugin' };
      await PluginModel.update(pluginData.identifier, updatedPluginData);
      const plugins = await PluginModel.getList();
      expect(plugins).toHaveLength(1);
      expect(plugins[0]).toEqual(updatedPluginData);
    });
  });

  describe('clear', () => {
    it('should clear the table', async () => {
      await PluginModel.create(pluginData);
      await PluginModel.clear();
      const plugins = await PluginModel.getList();
      expect(plugins).toHaveLength(0);
    });
  });
});
