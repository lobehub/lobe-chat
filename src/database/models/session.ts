import { BaseModel } from '@/database/core';
import { DB_SessionSchema } from '@/database/schemas/session';
import { LobeAgentSession } from '@/types/session';
import { uuid } from '@/utils/uuid';

class _SessionModel extends BaseModel {
  constructor() {
    super('sessions', DB_SessionSchema);
  }

  async create(type: 'agent' | 'group', defaultValue: Partial<LobeAgentSession>) {
    const id = uuid();

    return this.add({ type, ...defaultValue }, id);
  }

  async query() {
    return this.table.bulkGet(await this.table.toCollection().primaryKeys());
  }

  async findById(id: string) {
    return this.table.get(id);
  }

  async delete(id: string) {
    return this.table.delete(id);
  }

  async clearTable() {
    return this.table.clear();
  }
}

export const SessionModel = new _SessionModel();
