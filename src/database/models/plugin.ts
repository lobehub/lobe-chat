import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';

import { BaseModel } from '@/database/core';
import { LobeTool } from '@/types/tool';
import { merge } from '@/utils/merge';

import { DB_Plugin, DB_PluginSchema } from '../schemas/plugin';

export interface InstallPluginParams {
  identifier: string;
  manifest?: LobeChatPluginManifest;
  type: 'plugin' | 'customPlugin';
}

class _PluginModel extends BaseModel {
  constructor() {
    super('plugins', DB_PluginSchema);
  }
  // **************** Query *************** //

  getList = async (): Promise<DB_Plugin[]> => {
    return this.table.toArray();
  };

  // **************** Create *************** //

  create = async (plugin: InstallPluginParams) => {
    const old = await this.table.get(plugin.identifier);
    const dbPlugin = this.mapToDBPlugin(plugin);

    return this.table.put(merge(old, dbPlugin), plugin.identifier);
  };

  batchCreate = async (plugins: LobeTool[]) => {
    const dbPlugins = plugins.map((item) => this.mapToDBPlugin(item));

    return this._batchAdd(dbPlugins);
  };
  // **************** Delete *************** //

  delete(id: string) {
    return this.table.delete(id);
  }
  clear() {
    return this.table.clear();
  }

  // **************** Update *************** //

  update: (id: string, value: Partial<DB_Plugin>) => Promise<number> = async (id, value) => {
    return this.table.update(id, value);
  };

  // **************** Helper *************** //

  mapToDBPlugin(plugin: LobeTool) {
    return { ...plugin, id: plugin.identifier } as DB_Plugin;
  }
}

export const PluginModel = new _PluginModel();
