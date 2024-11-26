import { z } from 'zod';

export enum ThreadType {
  Continuation = 'continuation',
  Standalone = 'standalone',
}

export enum ThreadStatus {
  Active = 'active',
  Archived = 'archived',
  Deprecated = 'deprecated',
}

export interface ThreadItem {
  createdAt: Date;
  id: string;
  lastActiveAt: Date;
  parentThreadId?: string;
  sourceMessageId: string;
  status: ThreadStatus;
  title: string;
  topicId: string;
  type: ThreadType;
  updatedAt: Date;
  userId: string;
}

export interface CreateThreadParams {
  parentThreadId?: string;
  sourceMessageId: string;
  title?: string;
  topicId: string;
  type: ThreadType;
}

export const createThreadSchema = z.object({
  parentThreadId: z.string().optional(),
  sourceMessageId: z.string(),
  title: z.string().optional(),
  topicId: z.string(),
  type: z.nativeEnum(ThreadType),
});
