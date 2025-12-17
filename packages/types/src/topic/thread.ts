import { z } from 'zod';

export const ThreadType = {
  Continuation: 'continuation',
  Isolation: 'isolation',
  Standalone: 'standalone',
} as const;

export type IThreadType = (typeof ThreadType)[keyof typeof ThreadType];

export enum ThreadStatus {
  Active = 'active',
  Cancel = 'cancel',
  Completed = 'completed',
  Failed = 'failed',
  InReview = 'inReview',
  Pending = 'pending',
  Processing = 'processing',
  Todo = 'todo',
}

/**
 * Metadata for Thread, used for agent task execution
 */
export interface ThreadMetadata {
  /** Task completion time */
  completedAt?: string;
  /** Error message when task failed */
  error?: string;
}

export interface ThreadItem {
  /** Agent ID for agent task execution */
  agentId?: string | null;
  createdAt: Date;
  id: string;
  lastActiveAt: Date;
  /** Metadata for agent task execution */
  metadata?: ThreadMetadata;
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
  /** Agent ID for agent task execution */
  agentId?: string;
  parentThreadId?: string;
  sourceMessageId?: string;
  title?: string;
  topicId: string;
  type: IThreadType;
}

export const createThreadSchema = z.object({
  agentId: z.string().optional(),
  parentThreadId: z.string().optional(),
  sourceMessageId: z.string().optional(),
  title: z.string().optional(),
  topicId: z.string(),
  type: z.enum([ThreadType.Continuation, ThreadType.Standalone, ThreadType.Isolation]),
});
