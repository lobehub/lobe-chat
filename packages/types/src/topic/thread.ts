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
  sourceMessageId?: string | null;
  status: ThreadStatus;
  title: string;
  topicId: string;
  type: ThreadType;
  updatedAt: Date;
  userId: string;
}

/**
 * Metadata for Thread, used for agent task execution
 */
export interface ThreadMetadata {
  /** Task completion time */
  completedAt?: string;
  /** Execution duration in milliseconds */
  duration?: number;
  /** Error message when task failed */
  error?: string;
  /** Operation ID for tracking */
  operationId?: string;
  /** Task start time, used to calculate duration */
  startedAt?: string;
  /** Total cost in dollars */
  totalCost?: number;
  /** Total messages created during execution */
  totalMessages?: number;
  /** Total tokens consumed */
  totalTokens?: number;
  /** Total tool calls made */
  totalToolCalls?: number;
}

export interface CreateThreadParams {
  parentThreadId?: string;
  sourceMessageId?: string;
  title?: string;
  topicId: string;
  type: ThreadType;
}

export const createThreadSchema = z.object({
  parentThreadId: z.string().optional(),
  sourceMessageId: z.string().optional(),
  title: z.string().optional(),
  topicId: z.string(),
  type: z.nativeEnum(ThreadType),
});
