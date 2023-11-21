import { ZodSchema } from 'zod';

import { nanoid } from '@/utils/uuid';

import { LocalDB, LocalDBInstance, LocalDBSchema } from './db';

export class BaseModel<N extends keyof LocalDBSchema = any, T = LocalDBSchema[N]['table']> {
  private readonly db: LocalDB;
  private readonly schema: ZodSchema;
  private readonly _tableName: keyof LocalDBSchema;

  constructor(table: N, schema: ZodSchema, db = LocalDBInstance) {
    this.db = db;
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

    const record: any = { ...result.data, createdAt: Date.now(), id, updatedAt: Date.now() };

    const newId = await this.db[tableName].add(record);

    return { id: newId };
  }
}
