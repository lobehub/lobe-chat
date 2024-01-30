import { DeepPartial } from 'utility-types';

import { BaseModel } from '@/database/core';
import { GlobalSettings } from '@/types/settings';

import { DB_User, DB_UserSchema } from '../schemas/user';

class _UserModel extends BaseModel {
  constructor() {
    super('users', DB_UserSchema);
  }

  getUser = async (): Promise<DB_User & { id: number }> => {
    const hasUSer = !!(await this.table.count());

    if (!hasUSer) await this.table.put({});

    const list = await this.table.toArray();

    return list[0];
  };

  create = async (user: DB_User) => {
    return this.table.put(user);
  };

  private update = async (id: number, value: DeepPartial<DB_User>) => {
    return this.table.update(id, value);
  };

  clear() {
    return this.table.clear();
  }

  async updateSettings(settings: DeepPartial<GlobalSettings>) {
    const user = await this.getUser();

    return this.update(user.id, { settings: settings as any });
  }

  async resetSettings() {
    const user = await this.getUser();

    return this.update(user.id, { avatar: undefined, settings: undefined });
  }

  async updateAvatar(avatar: string) {
    const user = await this.getUser();

    return this.update(user.id, { avatar });
  }
}

export const UserModel = new _UserModel();
