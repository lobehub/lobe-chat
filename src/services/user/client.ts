import { DeepPartial } from 'utility-types';

import { clientDB } from '@/database/client/db';
import { users } from '@/database/schemas';
import { MessageModel } from '@/database/server/models/message';
import { SessionModel } from '@/database/server/models/session';
import { UserModel } from '@/database/server/models/user';
import { BaseClientService } from '@/services/baseClientService';
import { UserGuide, UserInitializationState, UserPreference } from '@/types/user';
import { UserSettings } from '@/types/user/settings';
import { AsyncLocalStorage } from '@/utils/localStorage';

import { IUserService } from './type';

export class ClientService extends BaseClientService implements IUserService {
  private preferenceStorage: AsyncLocalStorage<UserPreference>;

  private get userModel(): UserModel {
    return new UserModel(clientDB as any, this.userId);
  }
  private get messageModel(): MessageModel {
    return new MessageModel(clientDB as any, this.userId);
  }
  private get sessionModel(): SessionModel {
    return new SessionModel(clientDB as any, this.userId);
  }

  constructor(userId?: string) {
    super(userId);
    this.preferenceStorage = new AsyncLocalStorage('LOBE_PREFERENCE');
  }

  async getUserState(): Promise<UserInitializationState> {
    // if user not exist in the db, create one to make sure the user exist
    await this.makeSureUserExist();

    const state = await this.userModel.getUserState((encryptKeyVaultsStr) =>
      encryptKeyVaultsStr ? JSON.parse(encryptKeyVaultsStr) : {},
    );

    const user = await UserModel.findById(clientDB as any, this.userId);
    const messageCount = await this.messageModel.count();
    const sessionCount = await this.sessionModel.count();

    return {
      ...state,
      avatar: user?.avatar as string,
      canEnablePWAGuide: messageCount >= 4,
      canEnableTrace: messageCount >= 4,
      hasConversation: messageCount > 0 || sessionCount > 0,
      isOnboard: true,
      preference: await this.preferenceStorage.getFromLocalStorage(),
    };
  }

  updateUserSettings = async (value: DeepPartial<UserSettings>) => {
    const { keyVaults, ...res } = value;

    return this.userModel.updateSetting({ ...res, keyVaults: JSON.stringify(keyVaults) });
  };

  resetUserSettings = async () => {
    return this.userModel.deleteSetting();
  };

  async updateAvatar(avatar: string) {
    await this.userModel.updateUser({ avatar });
  }

  async updatePreference(preference: Partial<UserPreference>) {
    await this.preferenceStorage.saveToLocalStorage(preference);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,unused-imports/no-unused-vars
  async updateGuide(guide: Partial<UserGuide>) {
    throw new Error('Method not implemented.');
  }

  async makeSureUserExist() {
    const existUsers = await clientDB.query.users.findMany();

    let user: { id: string };
    if (existUsers.length === 0) {
      const result = await clientDB.insert(users).values({ id: this.userId }).returning();
      user = result[0];
    } else {
      user = existUsers[0];
    }

    return user;
  }
}
