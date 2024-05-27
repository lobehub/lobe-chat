import { DeepPartial } from 'utility-types';

import { BaseModel } from '@/database/client/core';
import { LobeAgentConfig } from '@/types/agent';
import { UserSettings } from '@/types/user/settings';
import { uuid } from '@/utils/uuid';

import { DB_User, DB_UserSchema } from '../schemas/user';

class _UserModel extends BaseModel {
  constructor() {
    super('users', DB_UserSchema);
  }
  // **************** Query *************** //

  getUser = async (): Promise<DB_User & { id: number }> => {
    const noUser = !(await this.table.count());

    if (noUser) await this.table.put({ uuid: uuid() });

    const list = (await this.table.toArray()) as (DB_User & { id: number })[];

    return list[0];
  };

  getAgentConfig = async () => {
    const user = await this.getUser();

    return user.settings?.defaultAgent?.config as LobeAgentConfig;
  };
  // **************** Create *************** //

  create = async (user: DB_User) => {
    return this.table.put(user);
  };

  // **************** Delete *************** //

  clear() {
    return this.table.clear();
  }

  // **************** Update *************** //

  async updateSettings(settings: DeepPartial<UserSettings>) {
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

  // **************** Helper *************** //

  private update = async (id: number, value: DeepPartial<DB_User>) => {
    return this.table.update(id, value);
  };
}

export const UserModel = new _UserModel();
