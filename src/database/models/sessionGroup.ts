import { BaseModel } from '@/database/core';
import { DB_SessionGroup, DB_SessionGroupSchema } from '@/database/schemas/sessionGroup';
import { SessionGroups } from '@/types/session';
import { nanoid } from '@/utils/uuid';

class _SessionGroupModel extends BaseModel {
  constructor() {
    super('sessionGroups', DB_SessionGroupSchema);
  }

  async create(name: string, sort?: number, id = nanoid()) {
    return this._add({ name, sort }, id);
  }

  async batchCreate(groups: SessionGroups) {
    return this._batchAdd(groups, { idGenerator: nanoid });
  }

  async update(id: string, data: Partial<DB_SessionGroup>) {
    return super._update(id, data);
  }

  async delete(id: string, removeGroupItem: boolean = false) {
    if (!removeGroupItem) return this.table.delete(id);

    // TODO: delete all session associated with the sessionGroup
  }

  async query(): Promise<SessionGroups> {
    const allGroups = await this.table.toArray();

    // 自定义排序，先按 sort 存在与否分组，然后分别排序
    return allGroups.sort((a, b) => {
      // 如果两个项都有 sort，则按 sort 排序
      if (a.sort !== undefined && b.sort !== undefined) {
        return a.sort - b.sort;
      }
      // 如果 a 有 sort 而 b 没有，则 a 排在前面
      if (a.sort !== undefined) {
        return -1;
      }
      // 如果 b 有 sort 而 a 没有，则 b 排在前面
      if (b.sort !== undefined) {
        return 1;
      }
      // 如果两个项都没有 sort，则按 createdAt 倒序排序
      if (a.createdAt && b.createdAt) {
        return b.createdAt - a.createdAt;
      }
      return 0;
    });
  }

  async updateOrder(sortMap: { id: string; sort: number }[]) {
    return this.db.transaction('rw', this.table, async () => {
      for (const { id, sort } of sortMap) {
        await this.table.update(id, { sort });
      }
    });
  }
}

export const SessionGroupModel = new _SessionGroupModel();
