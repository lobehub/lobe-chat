import { eq } from 'drizzle-orm';
import { and, asc, desc } from 'drizzle-orm/expressions';

import { serverDB } from '@/database/server';
import { idGenerator } from '@/database/server/utils/idGenerator';

import { SessionGroupItem, sessionGroups } from '../schemas/lobechat';

export class SessionGroupModel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  create = async (params: { name: string; sort?: number }) => {
    const [result] = await serverDB
      .insert(sessionGroups)
      .values({ ...params, id: this.genId(), userId: this.userId })
      .returning();

    return result;
  };

  delete = async (id: string) => {
    return serverDB
      .delete(sessionGroups)
      .where(and(eq(sessionGroups.id, id), eq(sessionGroups.userId, this.userId)));
  };

  deleteAll = async () => {
    return serverDB.delete(sessionGroups).where(eq(sessionGroups.userId, this.userId));
  };

  query = async () => {
    return serverDB.query.sessionGroups.findMany({
      orderBy: [asc(sessionGroups.sort), desc(sessionGroups.createdAt)],
      where: eq(sessionGroups.userId, this.userId),
    });
  };

  findById = async (id: string) => {
    return serverDB.query.sessionGroups.findFirst({
      where: and(eq(sessionGroups.id, id), eq(sessionGroups.userId, this.userId)),
    });
  };

  async update(id: string, value: Partial<SessionGroupItem>) {
    return serverDB
      .update(sessionGroups)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(sessionGroups.id, id), eq(sessionGroups.userId, this.userId)));
  }

  async updateOrder(sortMap: { id: string; sort: number }[]) {
    await serverDB.transaction(async (tx) => {
      const updates = sortMap.map(({ id, sort }) => {
        return tx
          .update(sessionGroups)
          .set({ sort, updatedAt: new Date() })
          .where(and(eq(sessionGroups.id, id), eq(sessionGroups.userId, this.userId)));
      });

      await Promise.all(updates);
    });
  }

  private genId = () => idGenerator('sessionGroups');
}
