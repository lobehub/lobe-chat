import { BaseModel } from '@/database/core';
import { DB_Session, DB_SessionSchema } from '@/database/schemas/session';
import { LobeAgentSession, SessionGroupKey } from '@/types/session';
import { uuid } from '@/utils/uuid';

class _SessionModel extends BaseModel {
  constructor() {
    super('sessions', DB_SessionSchema);
  }

  async create(type: 'agent' | 'group', defaultValue: Partial<LobeAgentSession>) {
    const id = uuid();

    return this._add({ type, ...defaultValue }, id);
  }

  async batchCreate(sessions: LobeAgentSession[]) {
    return this._batchAdd(sessions, { idGenerator: uuid });
  }

  async query({ pageSize = 9999, current = 0 }: { current?: number; pageSize?: number } = {}) {
    const offset = current * pageSize;

    return this.table.orderBy('updatedAt').reverse().offset(offset).limit(pageSize).toArray();
  }

  /**
   * get sessions by group
   * @param group
   */
  async queryByGroup(group: SessionGroupKey) {
    return this.table.where('group').equals(group).toArray();
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

  async update(id: string, data: Partial<DB_Session>) {
    return super._update(id, data);
  }
}

export const SessionModel = new _SessionModel();
