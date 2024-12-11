import { DeepPartial } from 'utility-types';

import { clientDB } from '@/database/client/db';
import { MessageModel } from '@/database/server/models/message';
import { SessionModel } from '@/database/server/models/session';
import { UserModel } from '@/database/server/models/user';
import { UserGuide, UserInitializationState, UserPreference } from '@/types/user';
import { UserSettings } from '@/types/user/settings';
import { AsyncLocalStorage } from '@/utils/localStorage';

import { IUserService } from './type';

export class ClientService implements IUserService {
  private preferenceStorage: AsyncLocalStorage<UserPreference>;
  private userModel: UserModel;
  private messageModel: MessageModel;
  private sessionModel: SessionModel;
  private userId: string;

  constructor(userId: string) {
    this.preferenceStorage = new AsyncLocalStorage('LOBE_PREFERENCE');
    this.userModel = new UserModel(clientDB as any, userId);
    this.userId = userId;
    this.messageModel = new MessageModel(clientDB as any, userId);
    this.sessionModel = new SessionModel(clientDB as any, userId);
  }

  async getUserState(): Promise<UserInitializationState> {
    const state = await this.userModel.getUserState();
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

  updateUserSettings = async (patch: DeepPartial<UserSettings>) => {
    return this.userModel.updateSetting(patch);
  };

  resetUserSettings = async () => {
    return this.userModel.deleteSetting();
  };

  updateAvatar(avatar: string) {
    return this.userModel.updateUser({ avatar });
  }

  async updatePreference(preference: Partial<UserPreference>) {
    await this.preferenceStorage.saveToLocalStorage(preference);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,unused-imports/no-unused-vars
  async updateGuide(guide: Partial<UserGuide>) {
    throw new Error('Method not implemented.');
  }
}
