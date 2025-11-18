/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */
import { z } from 'zod';

import { UploadFileItem } from '../../files';
import { MessageSemanticSearchChunk } from '../../rag';
import { ChatMessageError, ChatMessageErrorSchema } from '../common/base';
import { ChatPluginPayload, ToolInterventionSchema } from '../common/tools';
import { UIChatMessage } from './chat';
import { SemanticSearchChunkSchema } from './rag';

export type CreateMessageRoleType = 'user' | 'assistant' | 'tool' | 'supervisor';

export interface CreateMessageParams
  extends Partial<Omit<UIChatMessage, 'content' | 'role' | 'topicId' | 'chunksList'>> {
  content: string;
  error?: ChatMessageError | null;
  fileChunks?: MessageSemanticSearchChunk[];
  files?: string[];
  model?: string;
  provider?: string;
  groupId?: string;
  role: CreateMessageRoleType;
  sessionId: string;
  targetId?: string | null;
  threadId?: string | null;
  topicId?: string;
  traceId?: string;
}

/**
 * Parameters for creating a new message with full message list return
 * This type is completely independent from UIChatMessage to ensure clean API contract
 */
export interface CreateNewMessageParams {
  // ========== Required fields ==========
  role: CreateMessageRoleType;
  content: string;
  sessionId: string;

  // ========== Tool related ==========
  tool_call_id?: string;
  plugin?: ChatPluginPayload;

  // ========== Grouping ==========
  parentId?: string;
  groupId?: string;

  // ========== Context ==========
  topicId?: string;
  threadId?: string;
  targetId?: string | null;

  // ========== Model info ==========
  model?: string;
  provider?: string;

  // ========== Content ==========
  files?: string[];

  // ========== Error handling ==========
  error?: ChatMessageError | null;

  // ========== Metadata ==========
  traceId?: string;
  fileChunks?: MessageSemanticSearchChunk[];
}

export interface SendMessageParams {
  /**
   * create a thread
   */
  createThread?: boolean;
  files?: UploadFileItem[];
  /**
   *
   * https://github.com/lobehub/lobe-chat/pull/2086
   */
  isWelcomeQuestion?: boolean;
  message: string;
  /**
   * Additional metadata for the message (e.g., mentioned users)
   */
  metadata?: Record<string, any>;
  onlyAddUserMessage?: boolean;
}

export interface SendThreadMessageParams {
  /**
   * create a thread
   */
  createNewThread?: boolean;
  // files?: UploadFileItem[];
  message: string;
  onlyAddUserMessage?: boolean;
}

export interface SendGroupMessageParams {
  files?: UploadFileItem[];
  groupId: string;
  message: string;
  /**
   * Additional metadata for the message (e.g., mentioned users)
   */
  metadata?: Record<string, any>;
  onlyAddUserMessage?: boolean;
  /**
   * for group chat
   */
  targetMemberId?: string | null;
}

// ========== Zod Schemas ========== //

const UIMessageRoleTypeSchema = z.enum(['user', 'assistant', 'tool', 'supervisor']);

const ChatPluginPayloadSchema = z.object({
  apiName: z.string(),
  arguments: z.string(),
  identifier: z.string(),
  type: z.string(),
});

export const CreateNewMessageParamsSchema = z
  .object({
    // Required fields
    role: UIMessageRoleTypeSchema,
    content: z.string(),
    sessionId: z.string().nullable().optional(),
    // Tool related
    tool_call_id: z.string().optional(),
    plugin: ChatPluginPayloadSchema.optional(),
    // Grouping
    parentId: z.string().optional(),
    groupId: z.string().nullable().optional(),
    // Context
    topicId: z.string().nullable().optional(),
    threadId: z.string().nullable().optional(),
    targetId: z.string().nullable().optional(),
    // Model info
    model: z.string().nullable().optional(),
    provider: z.string().nullable().optional(),
    // Content
    files: z.array(z.string()).optional(),
    // Error handling
    error: ChatMessageErrorSchema.nullable().optional(),
    // Metadata
    traceId: z.string().optional(),
    fileChunks: z.array(SemanticSearchChunkSchema).optional(),
  })
  .passthrough();

export const UpdateMessagePluginSchema = z.object({
  id: z.string().optional(),
  toolCallId: z.string().optional(),
  type: z.string().optional(),
  intervention: ToolInterventionSchema.optional(),
  apiName: z.string().optional(),
  arguments: z.string().optional(),
  identifier: z.string().optional(),
  state: z.any().optional(),
  error: z.any().optional(),
  clientId: z.string().optional(),
  userId: z.string().optional(),
});
