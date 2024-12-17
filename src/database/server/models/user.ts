import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm/expressions';
import { DeepPartial } from 'utility-types';

import { LobeChatDatabase } from '@/database/type';
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
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  getUserState = async () => {
    const result = await this.db
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
      .where(eq(users.id, this.userId))
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
          console.error(`Failed to parse keyVaults ,userId: ${this.userId}. Error:`, e);
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
      userId: this.userId,
    };
  };

  updateUser = async (value: Partial<UserItem>) => {
    return this.db
      .update(users)
      .set({ ...value, updatedAt: new Date() })
      .where(eq(users.id, this.userId));
  };

  deleteSetting = async () => {
    return this.db.delete(userSettings).where(eq(userSettings.id, this.userId));
  };

  updateSetting = async (value: Partial<UserSettings>) => {
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
    const settings = await this.db.query.userSettings.findFirst({
      where: eq(users.id, this.userId),
    });
    if (!settings) {
      await this.db.insert(userSettings).values({ id: this.userId, ...newValue });
      return;
    }

    return this.db.update(userSettings).set(newValue).where(eq(userSettings.id, this.userId));
  };

  updatePreference = async (value: Partial<UserPreference>) => {
    const user = await this.db.query.users.findFirst({ where: eq(users.id, this.userId) });
    if (!user) return;

    return this.db
      .update(users)
      .set({ preference: merge(user.preference, value) })
      .where(eq(users.id, this.userId));
  };

  updateGuide = async (value: Partial<UserGuide>) => {
    const user = await this.db.query.users.findFirst({ where: eq(users.id, this.userId) });
    if (!user) return;

    const prevPreference = (user.preference || {}) as UserPreference;
    return this.db
      .update(users)
      .set({ preference: { ...prevPreference, guide: merge(prevPreference.guide || {}, value) } })
      .where(eq(users.id, this.userId));
  };

  // Static method

  static createUser = async (db: LobeChatDatabase, params: NewUser) => {
    // if user already exists, skip creation
    if (params.id) {
      const user = await db.query.users.findFirst({ where: eq(users.id, params.id) });
      if (!!user) return;
    }

    const [user] = await db
      .insert(users)
      .values({ ...params })
      .returning();

    // Create an inbox session for the user
    const model = new SessionModel(db, user.id);

    await model.createInbox();
  };

  static deleteUser = async (db: LobeChatDatabase, id: string) => {
    return db.delete(users).where(eq(users.id, id));
  };

  static findById = async (db: LobeChatDatabase, id: string) => {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  };

  static findByEmail = async (db: LobeChatDatabase, email: string) => {
    return db.query.users.findFirst({ where: eq(users.email, email) });
  };

  static getUserApiKeys = async (db: LobeChatDatabase, id: string) => {
    const result = await db
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
}
