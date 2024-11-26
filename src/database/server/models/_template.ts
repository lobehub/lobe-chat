import { eq } from 'drizzle-orm';
import { and, desc } from 'drizzle-orm/expressions';

import { serverDB } from '@/database/server';

import { NewSessionGroup, SessionGroupItem, sessionGroups } from '../schemas/lobechat';

export class TemplateModel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  create = async (params: NewSessionGroup) => {
    const [result] = await serverDB
      .insert(sessionGroups)
      .values({ ...params, userId: this.userId })
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
      orderBy: [desc(sessionGroups.updatedAt)],
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
}
