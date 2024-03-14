import { BaseModel } from '@/database/core';
import { merge } from '@/utils/merge';

import { DB_Plugin, DB_PluginSchema } from '../schemas/plugin';

class _PluginModel extends BaseModel {
  constructor() {
    super('plugins', DB_PluginSchema);
  }
  // **************** Query *************** //

  getList = async (): Promise<DB_Plugin[]> => {
    return this.table.toArray();
  };

  // **************** Create *************** //

  create = async (plugin: DB_Plugin) => {
    const old = await this.table.get(plugin.identifier);

    return this.table.put(merge(old, plugin), plugin.identifier);
  };

  batchCreate = async (plugins: DB_Plugin[]) => {
    return this._batchAdd(plugins);
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
}

export const PluginModel = new _PluginModel();
