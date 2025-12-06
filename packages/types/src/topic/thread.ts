import { z } from 'zod';

export const ThreadType = {
  Continuation: 'continuation',
  Standalone: 'standalone',
} as const;

export type IThreadType = (typeof ThreadType)[keyof typeof ThreadType];

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
  sourceMessageId?: string | null;
  status: ThreadStatus;
  title: string;
  topicId: string;
  type: IThreadType;
  updatedAt: Date;
  userId: string;
}

export interface CreateThreadParams {
  parentThreadId?: string;
  sourceMessageId?: string;
  title?: string;
  topicId: string;
  type: IThreadType;
}

export const createThreadSchema = z.object({
  parentThreadId: z.string().optional(),
  sourceMessageId: z.string().optional(),
  title: z.string().optional(),
  topicId: z.string(),
  type: z.enum([ThreadType.Continuation, ThreadType.Standalone]),
});
