import Dexie, { Transaction } from 'dexie';

import { DB_File } from '@/database/schemas/files';
import { DB_Message } from '@/database/schemas/message';
import { DB_Plugin } from '@/database/schemas/plugin';
import { DB_Session } from '@/database/schemas/session';
import { DB_SessionGroup } from '@/database/schemas/sessionGroup';
import { DB_Topic } from '@/database/schemas/topic';
import { DB_User } from '@/database/schemas/user';

import { migrateSettingsToUser } from './migrations/migrateSettingsToUser';
import { dbSchemaV1, dbSchemaV2, dbSchemaV3, dbSchemaV4, dbSchemaV5 } from './schemas';
import { DBModel, LOBE_CHAT_LOCAL_DB_NAME } from './types/db';

interface LobeDBSchemaMap {
  files: DB_File;
  messages: DB_Message;
  plugins: DB_Plugin;
  sessionGroups: DB_SessionGroup;
  sessions: DB_Session;
  topics: DB_Topic;
  users: DB_User;
}

// Define a local DB
export class LocalDB extends Dexie {
  public files: LobeDBTable<'files'>;
  public sessions: LobeDBTable<'sessions'>;
  public messages: LobeDBTable<'messages'>;
  public topics: LobeDBTable<'topics'>;
  public plugins: LobeDBTable<'plugins'>;
  public sessionGroups: LobeDBTable<'sessionGroups'>;
  public users: LobeDBTable<'users'>;

  constructor() {
    super(LOBE_CHAT_LOCAL_DB_NAME);
    this.version(1).stores(dbSchemaV1);
    this.version(2).stores(dbSchemaV2);
    this.version(3).stores(dbSchemaV3);
    this.version(4)
      .stores(dbSchemaV4)
      .upgrade((trans) => this.upgradeToV4(trans));

    this.version(5)
      .stores(dbSchemaV5)
      .upgrade((trans) => this.upgradeToV5(trans));

    this.files = this.table('files');
    this.sessions = this.table('sessions');
    this.messages = this.table('messages');
    this.topics = this.table('topics');
    this.plugins = this.table('plugins');
    this.sessionGroups = this.table('sessionGroups');
    this.users = this.table('users');
  }

  /**
   * 2024.01.22
   *
   * DB V3 to V4
   * from `group = pinned` to `pinned:true`
   */
  upgradeToV4 = async (trans: Transaction) => {
    const sessions = trans.table('sessions');
    await sessions.toCollection().modify((session) => {
      // translate boolean to number
      session.pinned = session.group === 'pinned' ? 1 : 0;
      session.group = 'default';
    });
  };

  /**
   * 2024.01.29
   * settings from localStorage to indexedDB
   */
  upgradeToV5 = async (trans: Transaction) => {
    const users = trans.table('users');

    // if no user, create one
    if ((await users.count()) === 0) {
      const data = localStorage.getItem('LOBE_SETTINGS');

      if (data) {
        let json;

        try {
          json = JSON.parse(data);
        } catch {
          /* empty */
        }

        if (!json?.state?.settings) return;

        const settings = json.state.settings;

        const user = migrateSettingsToUser(settings);
        await users.add(user);
      }
    }
  };
}

export const LocalDBInstance = new LocalDB();

// ================================================ //
// ================================================ //
// ================================================ //
// ================================================ //
// ================================================ //

// types helper
export type LocalDBSchema = {
  [t in keyof LobeDBSchemaMap]: {
    model: LobeDBSchemaMap[t];
    table: Dexie.Table<DBModel<LobeDBSchemaMap[t]>, string>;
  };
};
type LobeDBTable<T extends keyof LobeDBSchemaMap> = LocalDBSchema[T]['table'];
