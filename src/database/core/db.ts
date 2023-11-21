import Dexie from 'dexie';

import { DB_Message } from '@/database/schemas/message';
import { DB_Session } from '@/database/schemas/session';
import { DB_Topic } from '@/database/schemas/topic';
import { DBModel } from '@/types/database/db';
import { LocalFile } from '@/types/database/files';

import { dbSchemaV1, dbSchemaV2 } from './schemas';

interface LobeDBSchemaMap {
  files: LocalFile;
  messages: DB_Message;
  sessions: DB_Session;
  topics: DB_Topic;
}

// Define a local DB
export class LocalDB extends Dexie {
  public files: LobeDBTable<'files'>;
  public sessions: LobeDBTable<'sessions'>;
  public messages: LobeDBTable<'messages'>;
  public topics: LobeDBTable<'topics'>;

  constructor() {
    super('LOBE_CHAT_DB');
    this.version(1).stores(dbSchemaV1);

    this.version(2).stores(dbSchemaV2);

    this.files = this.table('files');
    this.sessions = this.table('sessions');
    this.messages = this.table('messages');
    this.topics = this.table('topics');
  }
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
