import { eq } from 'drizzle-orm';
import { and, desc } from 'drizzle-orm/expressions';

import { serverDB } from '@/database/server';
import { CreateThreadParams, ThreadStatus } from '@/types/topic';

import { ThreadItem, threads } from '../schemas/lobechat';

const queryColumns = {
  createdAt: threads.createdAt,
  id: threads.id,
  parentThreadId: threads.parentThreadId,
  sourceMessageId: threads.sourceMessageId,
  status: threads.status,
  title: threads.title,
  topicId: threads.topicId,
  type: threads.type,
  updatedAt: threads.updatedAt,
};

export class ThreadModel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  create = async (params: CreateThreadParams) => {
    // @ts-ignore
    const [result] = await serverDB
      .insert(threads)
      .values({ ...params, status: ThreadStatus.Active, userId: this.userId })
      .onConflictDoNothing()
      .returning();

    return result;
  };

  delete = async (id: string) => {
    return serverDB.delete(threads).where(and(eq(threads.id, id), eq(threads.userId, this.userId)));
  };

  deleteAll = async () => {
    return serverDB.delete(threads).where(eq(threads.userId, this.userId));
  };

  query = async () => {
    const data = await serverDB
      .select(queryColumns)
      .from(threads)
      .where(eq(threads.userId, this.userId))
      .orderBy(desc(threads.updatedAt));

    return data as ThreadItem[];
  };

  queryByTopicId = async (topicId: string) => {
    const data = await serverDB
      .select(queryColumns)
      .from(threads)
      .where(and(eq(threads.topicId, topicId), eq(threads.userId, this.userId)))
      .orderBy(desc(threads.updatedAt));

    return data as ThreadItem[];
  };

  findById = async (id: string) => {
    return serverDB.query.threads.findFirst({
      where: and(eq(threads.id, id), eq(threads.userId, this.userId)),
    });
  };

  async update(id: string, value: Partial<ThreadItem>) {
    return serverDB
      .update(threads)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(threads.id, id), eq(threads.userId, this.userId)));
  }
}
