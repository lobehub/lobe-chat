import { BaseModel } from '@/database/core';
import { merge } from '@/utils/merge';

import { DB_Plugin, DB_PluginSchema } from '../schemas/plugin';

class _PluginModel extends BaseModel {
  constructor() {
    super('plugins', DB_PluginSchema);
  }

  getList = async (): Promise<DB_Plugin[]> => {
    return this.table.toArray();
  };

  create = async (plugin: DB_Plugin) => {
    const old = await this.table.get(plugin.identifier);

    return this.table.put(merge(old, plugin), plugin.identifier);
  };

  batchCreate = async (plugins: DB_Plugin[]) => {
    return this._batchAdd(plugins);
  };

  delete(id: string) {
    return this.table.delete(id);
  }

  update: (id: string, value: Partial<DB_Plugin>) => Promise<number> = async (id, value) => {
    return this.table.update(id, value);
  };

  clear() {
    return this.table.clear();
  }
}

export const PluginModel = new _PluginModel();
