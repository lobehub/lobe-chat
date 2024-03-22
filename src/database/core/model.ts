import Dexie, { BulkError } from 'dexie';
import { ZodObject } from 'zod';

import { nanoid } from '@/utils/uuid';

import { LocalDB, LocalDBInstance, LocalDBSchema } from './db';
import { dataSync } from './sync';
import { DBBaseFieldsSchema } from './types/db';

export class BaseModel<N extends keyof LocalDBSchema = any, T = LocalDBSchema[N]['table']> {
  protected readonly db: LocalDB;
  private readonly schema: ZodObject<any>;
  private readonly _tableName: keyof LocalDBSchema;

  constructor(table: N, schema: ZodObject<any>, db = LocalDBInstance) {
    this.db = db;
    this.schema = schema;
    this._tableName = table;
  }

  get table() {
    return this.db[this._tableName] as Dexie.Table;
  }

  get yMap() {
    return dataSync.getYMap(this._tableName);
  }

  // **************** Create *************** //

  /**
   * create a new record
   */
  protected async _addWithSync<T = LocalDBSchema[N]['model']>(
    data: T,
    id: string | number = nanoid(),
    primaryKey: string = 'id',
  ) {
    const result = this.schema.safeParse(data);

    if (!result.success) {
      const errorMsg = `[${this.db.name}][${this._tableName}] Failed to create new record. Error: ${result.error}`;

      const newError = new TypeError(errorMsg);
      // make this error show on console to help debug
      console.error(newError);
      throw newError;
    }

    const tableName = this._tableName;

    const record: any = {
      ...result.data,
      createdAt: Date.now(),
      [primaryKey]: id,
      updatedAt: Date.now(),
    };

    const newId = await this.db[tableName].add(record);

    // sync data to yjs data map
    this.updateYMapItem(newId);

    return { id: newId };
  }

  /**
   * Batch create new records
   * @param dataArray An array of data to be added
   * @param options
   * @param options.generateId
   * @param options.createWithNewId
   */
  protected async _batchAdd<T = LocalDBSchema[N]['model']>(
    dataArray: T[],
    options: {
      /**
       * always create with a new id
       */
      createWithNewId?: boolean;
      idGenerator?: () => string;
      withSync?: boolean;
    } = {},
  ): Promise<{
    added: number;
    errors?: Error[];
    ids: string[];
    skips: string[];
    success: boolean;
  }> {
    const { idGenerator = nanoid, createWithNewId = false, withSync = true } = options;
    const validatedData: any[] = [];
    const errors = [];
    const skips: string[] = [];

    for (const data of dataArray) {
      const schemaWithId = this.schema.merge(DBBaseFieldsSchema.partial());

      const result = schemaWithId.safeParse(data);

      if (result.success) {
        const item = result.data;
        const autoId = idGenerator();

        const id = createWithNewId ? autoId : item.id ?? autoId;

        // skip if the id already exists
        if (await this.table.get(id)) {
          skips.push(id);
          continue;
        }

        validatedData.push({
          ...item,
          createdAt: item.createdAt ?? Date.now(),
          id,
          updatedAt: item.updatedAt ?? Date.now(),
        });
      } else {
        errors.push(result.error);

        const errorMsg = `[${this.db.name}][${
          this._tableName
        }] Failed to create the record. Data: ${JSON.stringify(data)}. Errors: ${result.error}`;
        console.error(new TypeError(errorMsg));
      }
    }
    if (validatedData.length === 0) {
      // No valid data to add
      return { added: 0, errors, ids: [], skips, success: false };
    }

    // Using bulkAdd to insert validated data
    try {
      await this.table.bulkAdd(validatedData);

      if (withSync) {
        dataSync.transact(() => {
          const pools = validatedData.map(async (item) => {
            await this.updateYMapItem(item.id);
          });
          Promise.all(pools);
        });
      }

      return {
        added: validatedData.length,
        ids: validatedData.map((item) => item.id),
        skips,
        success: true,
      };
    } catch (error) {
      const bulkError = error as BulkError;
      // Handle bulkAdd errors here
      console.error(`[${this.db.name}][${this._tableName}] Bulk add error:`, bulkError);
      // Return the number of successfully added records and errors
      return {
        added: validatedData.length - skips.length - bulkError.failures.length,
        errors: bulkError.failures,
        ids: validatedData.map((item) => item.id),
        skips,
        success: false,
      };
    }
  }

  // **************** Delete *************** //

  protected async _deleteWithSync(id: string) {
    const result = await this.table.delete(id);
    // sync delete data to yjs data map
    this.yMap?.delete(id);
    return result;
  }

  protected async _bulkDeleteWithSync(keys: string[]) {
    await this.table.bulkDelete(keys);
    // sync delete data to yjs data map

    dataSync.transact(() => {
      keys.forEach((id) => {
        this.yMap?.delete(id);
      });
    });
  }

  protected async _clearWithSync() {
    const result = await this.table.clear();
    // sync clear data to yjs data map
    this.yMap?.clear();
    return result;
  }

  // **************** Update *************** //

  protected async _updateWithSync(id: string, data: Partial<T>) {
    // we need to check whether the data is valid
    // pick data related schema from the full schema
    const keys = Object.keys(data);
    const partialSchema = this.schema.pick(Object.fromEntries(keys.map((key) => [key, true])));

    const result = partialSchema.safeParse(data);
    if (!result.success) {
      const errorMsg = `[${this.db.name}][${this._tableName}] Failed to update the record:${id}. Error: ${result.error}`;

      const newError = new TypeError(errorMsg);
      // make this error show on console to help debug
      console.error(newError);
      throw newError;
    }

    const success = await this.table.update(id, { ...data, updatedAt: Date.now() });

    // sync data to yjs data map
    this.updateYMapItem(id);

    return { success };
  }

  protected async _putWithSync(data: any, id: string) {
    const result = await this.table.put(data, id);

    // sync data to yjs data map
    this.updateYMapItem(id);

    return result;
  }

  protected async _bulkPutWithSync(items: T[]) {
    await this.table.bulkPut(items);

    await dataSync.transact(() => {
      items.forEach((items) => {
        this.updateYMapItem((items as any).id);
      });
    });
  }

  // **************** Helper *************** //

  private updateYMapItem = async (id: string) => {
    const newData = await this.table.get(id);
    this.yMap?.set(id, newData);
  };
}
