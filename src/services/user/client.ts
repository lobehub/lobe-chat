import { clientDB } from '@/database/client/db';
import { MessageModel } from '@/database/models/message';
import { SessionModel } from '@/database/models/session';
import { UserModel } from '@/database/models/user';
import { users } from '@/database/schemas';
import { BaseClientService } from '@/services/baseClientService';
import { UserPreference } from '@/types/user';
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

  getUserRegistrationDuration: IUserService['getUserRegistrationDuration'] = async () => {
    return this.userModel.getUserRegistrationDuration();
  };

  getUserState: IUserService['getUserState'] = async () => {
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
  };

  getUserSSOProviders: IUserService['getUserSSOProviders'] = async () => {
    // Account not exist on next-auth in client mode, no need to implement this method
    return [];
  };

  unlinkSSOProvider: IUserService['unlinkSSOProvider'] = async () => {
    // Account not exist on next-auth in client mode, no need to implement this method
  };

  updateUserSettings: IUserService['updateUserSettings'] = async (value) => {
    const { keyVaults, ...res } = value;

    return this.userModel.updateSetting({ ...res, keyVaults: JSON.stringify(keyVaults) });
  };

  resetUserSettings: IUserService['resetUserSettings'] = async () => {
    return this.userModel.deleteSetting();
  };

  updateAvatar = async (avatar: string) => {
    await this.userModel.updateUser({ avatar });
  };

  updatePreference: IUserService['updatePreference'] = async (preference) => {
    await this.preferenceStorage.saveToLocalStorage(preference);
  };

  updateGuide: IUserService['updateGuide'] = async () => {
    throw new Error('Method not implemented.');
  };

  makeSureUserExist = async () => {
    const existUsers = await clientDB.query.users.findMany();

    let user: { id: string };
    if (existUsers.length === 0) {
      const result = await clientDB.insert(users).values({ id: this.userId }).returning();
      user = result[0];
    } else {
      user = existUsers[0];
    }

    return user;
  };
}
