import { ZodSchema } from 'zod';

import { DBModel } from '@/types/database/db';
import { LocalFile } from '@/types/database/files';
import { nanoid } from '@/utils/uuid';

import { LocalDB, LocalDBInstance, LocalDBSchema } from './db';

export class BaseModel<N extends keyof LocalDBSchema = any> {
  private readonly db: LocalDB;
  private readonly schema: ZodSchema;
  private readonly _tableName: keyof LocalDBSchema;

  constructor(table: N, schema: ZodSchema) {
    this.db = LocalDBInstance;
    this.schema = schema;
    this._tableName = table;
  }

  get table() {
    return this.db[this._tableName];
  }

  /**
   * create a new record
   * @param data
   * @param id
   */
  protected async add<T = LocalDBSchema[N]['model']>(data: T, id: string | number = nanoid()) {
    const result = this.schema.safeParse(data);

    if (!result.success) {
      const errorMsg = `[${this.db.name}][${this._tableName}] Failed to create new record. Error: ${result.error}`;

      const newError = new TypeError(errorMsg);
      // make this error show on console to help debug
      console.error(newError);
      throw newError;
    }

    const tableName = this._tableName;

    const record: DBModel<LocalFile> = { ...result.data, createAt: Date.now(), id };

    const newId = await this.db[tableName].add(record);

    return { id: newId };
  }
}
