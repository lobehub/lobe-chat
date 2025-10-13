import { z } from 'zod';

import { ChatMessage } from './message';
import { ChatTopic } from './topic';

export interface SendNewMessage {
  content: string;
  // if message has attached with files, then add files to message and the agent
  files?: string[];
}

export interface SendMessageServerParams {
  newAssistantMessage: {
    model: string;
    provider: string;
  };
  newTopic?: {
    title?: string;
    topicMessageIds?: string[];
  };
  newUserMessage: SendNewMessage;
  sessionId?: string;
  threadId?: string;
  // if there is activeTopicId，then add topicId to message
  topicId?: string;
}

export const AiSendMessageServerSchema = z.object({
  newAssistantMessage: z.object({
    model: z.string().optional(),
    provider: z.string().optional(),
  }),
  newTopic: z
    .object({
      title: z.string().optional(),
      topicMessageIds: z.array(z.string()).optional(),
    })
    .optional(),
  newUserMessage: z.object({
    content: z.string(),
    files: z.array(z.string()).optional(),
  }),
  sessionId: z.string().optional(),
  threadId: z.string().optional(),
  topicId: z.string().optional(),
});

export interface SendMessageServerResponse {
  assistantMessageId: string;
  isCreatNewTopic: boolean;
  messages: ChatMessage[];
  topicId: string;
  topics?: ChatTopic[];
  userMessageId: string;
}

export const StructureSchema = z.object({
  description: z.string().optional(),
  name: z.string(),
  schema: z.object({
    additionalProperties: z.boolean().optional(),
    properties: z.record(z.string(), z.any()),
    required: z.array(z.string()).optional(),
    type: z.literal('object'),
  }),
  strict: z.boolean().optional(),
});

export const StructureOutputSchema = z.object({
  keyVaultsPayload: z.string(),
  messages: z.array(z.any()),
  model: z.string(),
  provider: z.string(),
  schema: StructureSchema,
});

export interface StructureOutputParams {
  keyVaultsPayload: string;
  messages: ChatMessage[];
  model: string;
  provider: string;
  schema: any;
}
