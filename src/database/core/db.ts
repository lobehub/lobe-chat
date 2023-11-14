import Dexie from 'dexie';

import { LobeDBSchemaMap as SchemaMap, lobeDBSchema } from '@/database/core/schema';
import { DBModel } from '@/types/database/db';

export type LocalDBSchema = {
  [t in keyof SchemaMap]: {
    model: SchemaMap[t];
    table: Dexie.Table<DBModel<SchemaMap[t]>, string>;
  };
};

// Define a local DB
export class LocalDB extends Dexie {
  public files: LocalDBSchema['files']['table'];

  constructor() {
    super('LOBE_CHAT_DB');
    this.version(1).stores(lobeDBSchema);

    this.files = this.table('files');
  }
}

export const LocalDBInstance = new LocalDB();
