import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { DeepPartial } from 'utility-types';

import { serverDB } from '@/database/server/core/db';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';
import { UserGuide, UserPreference } from '@/types/user';
import { UserKeyVaults, UserSettings } from '@/types/user/settings';
import { merge } from '@/utils/merge';

import { NewUser, UserItem, userSettings, users } from '../../schemas';
import { SessionModel } from './session';

export class UserNotFoundError extends TRPCError {
  constructor() {
    super({ code: 'UNAUTHORIZED', message: 'user not found' });
  }
}

export class UserModel {
  static createUser = async (params: NewUser) => {
    // if user already exists, skip creation
    if (params.id) {
      const user = await serverDB.query.users.findFirst({ where: eq(users.id, params.id) });
      if (!!user) return;
    }

    const [user] = await serverDB
      .insert(users)
      .values({ ...params })
      .returning();

    // Create an inbox session for the user
    const model = new SessionModel(user.id);

    await model.createInbox();
  };

  static deleteUser = async (id: string) => {
    return serverDB.delete(users).where(eq(users.id, id));
  };

  static findById = async (id: string) => {
    return serverDB.query.users.findFirst({ where: eq(users.id, id) });
  };

  static findByEmail = async (email: string) => {
    return serverDB.query.users.findFirst({ where: eq(users.email, email) });
  };

  getUserState = async (id: string) => {
    const result = await serverDB
      .select({
        isOnboarded: users.isOnboarded,
        preference: users.preference,

        settingsDefaultAgent: userSettings.defaultAgent,
        settingsGeneral: userSettings.general,
        settingsKeyVaults: userSettings.keyVaults,
        settingsLanguageModel: userSettings.languageModel,
        settingsSystemAgent: userSettings.systemAgent,
        settingsTTS: userSettings.tts,
        settingsTool: userSettings.tool,
      })
      .from(users)
      .where(eq(users.id, id))
      .leftJoin(userSettings, eq(users.id, userSettings.id));

    if (!result || !result[0]) {
      throw new UserNotFoundError();
    }

    const state = result[0];

    // Decrypt keyVaults
    let decryptKeyVaults = {};
    if (state.settingsKeyVaults) {
      const gateKeeper = await KeyVaultsGateKeeper.initWithEnvKey();
      const { wasAuthentic, plaintext } = await gateKeeper.decrypt(state.settingsKeyVaults);

      if (wasAuthentic) {
        try {
          decryptKeyVaults = JSON.parse(plaintext);
        } catch (e) {
          console.error(`Failed to parse keyVaults ,userId: ${id}. Error:`, e);
        }
      }
    }

    const settings: DeepPartial<UserSettings> = {
      defaultAgent: state.settingsDefaultAgent || {},
      general: state.settingsGeneral || {},
      keyVaults: decryptKeyVaults,
      languageModel: state.settingsLanguageModel || {},
      systemAgent: state.settingsSystemAgent || {},
      tool: state.settingsTool || {},
      tts: state.settingsTTS || {},
    };

    return {
      isOnboarded: state.isOnboarded,
      preference: state.preference as UserPreference,
      settings,
      userId: id,
    };
  };

  static getUserApiKeys = async (id: string) => {
    const result = await serverDB
      .select({
        settingsKeyVaults: userSettings.keyVaults,
      })
      .from(userSettings)
      .where(eq(userSettings.id, id));

    if (!result || !result[0]) {
      throw new UserNotFoundError();
    }

    const state = result[0];

    // Decrypt keyVaults
    let decryptKeyVaults = {};
    if (state.settingsKeyVaults) {
      const gateKeeper = await KeyVaultsGateKeeper.initWithEnvKey();
      const { wasAuthentic, plaintext } = await gateKeeper.decrypt(state.settingsKeyVaults);

      if (wasAuthentic) {
        try {
          decryptKeyVaults = JSON.parse(plaintext);
        } catch (e) {
          console.error(`Failed to parse keyVaults ,userId: ${id}. Error:`, e);
        }
      }
    }

    return decryptKeyVaults as UserKeyVaults;
  };

  async updateUser(id: string, value: Partial<UserItem>) {
    return serverDB
      .update(users)
      .set({ ...value, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async deleteSetting(id: string) {
    return serverDB.delete(userSettings).where(eq(userSettings.id, id));
  }

  async updateSetting(id: string, value: Partial<UserSettings>) {
    const { keyVaults, ...res } = value;

    // Encrypt keyVaults
    let encryptedKeyVaults: string | null = null;

    if (keyVaults) {
      // TODO: better to add a validation
      const data = JSON.stringify(keyVaults);
      const gateKeeper = await KeyVaultsGateKeeper.initWithEnvKey();

      encryptedKeyVaults = await gateKeeper.encrypt(data);
    }

    const newValue = { ...res, keyVaults: encryptedKeyVaults };

    // update or create user settings
    const settings = await serverDB.query.userSettings.findFirst({ where: eq(users.id, id) });
    if (!settings) {
      await serverDB.insert(userSettings).values({ id, ...newValue });
      return;
    }

    return serverDB.update(userSettings).set(newValue).where(eq(userSettings.id, id));
  }

  async updatePreference(id: string, value: Partial<UserPreference>) {
    const user = await serverDB.query.users.findFirst({ where: eq(users.id, id) });
    if (!user) return;

    return serverDB
      .update(users)
      .set({ preference: merge(user.preference, value) })
      .where(eq(users.id, id));
  }

  async updateGuide(id: string, value: Partial<UserGuide>) {
    const user = await serverDB.query.users.findFirst({ where: eq(users.id, id) });
    if (!user) return;

    const prevPreference = (user.preference || {}) as UserPreference;
    return serverDB
      .update(users)
      .set({ preference: { ...prevPreference, guide: merge(prevPreference.guide || {}, value) } })
      .where(eq(users.id, id));
  }
}
