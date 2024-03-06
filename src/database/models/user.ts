import { DeepPartial } from 'utility-types';

import { BaseModel } from '@/database/core';
import { GlobalSettings } from '@/types/settings';
import { uuid } from '@/utils/uuid';

import { DB_User, DB_UserSchema } from '../schemas/user';

class _UserModel extends BaseModel {
  constructor() {
    super('users', DB_UserSchema);
  }

  getUser = async (): Promise<DB_User & { id: number }> => {
    const noUser = !(await this.table.count());

    if (noUser) await this.table.put({ uuid: uuid() });

    const list = (await this.table.toArray()) as (DB_User & { id: number })[];

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
