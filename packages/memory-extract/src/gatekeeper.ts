import { GenerateObjectSchema } from '@lobechat/model-runtime';

import { BaseMemoryExtractor } from './base-extractor';
import { GatekeeperResult, GatekeeperResultSchema } from './types';

// JSON Schema for structured output
export const GatekeeperJsonSchema: GenerateObjectSchema = {
  name: 'gatekeeper_decision',
  schema: {
    additionalProperties: false,
    properties: {
      context: {
        additionalProperties: false,
        properties: {
          reasoning: { type: 'string' },
          shouldExtract: { type: 'boolean' },
        },
        required: ['shouldExtract', 'reasoning'],
        type: 'object',
      },
      experience: {
        additionalProperties: false,
        properties: {
          reasoning: { type: 'string' },
          shouldExtract: { type: 'boolean' },
        },
        required: ['shouldExtract', 'reasoning'],
        type: 'object',
      },
      identity: {
        additionalProperties: false,
        properties: {
          reasoning: { type: 'string' },
          shouldExtract: { type: 'boolean' },
        },
        required: ['shouldExtract', 'reasoning'],
        type: 'object',
      },
      preference: {
        additionalProperties: false,
        properties: {
          reasoning: { type: 'string' },
          shouldExtract: { type: 'boolean' },
        },
        required: ['shouldExtract', 'reasoning'],
        type: 'object',
      },
    },
    required: ['identity', 'context', 'preference', 'experience'],
    type: 'object' as const,
  },
  strict: true,
};

export interface GatekeeperOptions {
  retrievedContext?: string;
  topK?: number;
}
/**
 * UserMemoryGateKeeper
 * Analyzes conversations to determine which memory layers should be extracted
 */
export class UserMemoryGateKeeper extends BaseMemoryExtractor<GatekeeperResult, GatekeeperOptions> {
  protected getPromptFileName(): string {
    return 'gatekeeper.md';
  }

  protected getSchema(): GenerateObjectSchema {
    return GatekeeperJsonSchema;
  }

  protected getResultSchema() {
    return GatekeeperResultSchema;
  }

  protected getTemplateProps(options: GatekeeperOptions): Record<string, any> {
    return {
      retrievedContext: options.retrievedContext || 'No similar memories retrieved.',
      topK: options.topK ?? 10,
    };
  }

  protected buildUserPrompt(conversationText: string): string {
    return [
      'Conversation to Analyze (verbatim):',
      '---',
      conversationText,
      '---',
      'Return exactly ONE JSON object matching the schema. Write all reasoning fields in Chinese. Bias toward setting shouldExtract: false when uncertain.',
    ].join('\n');
  }

  /**
   * Alias for extract() method for backward compatibility
   */
  async check(messages: Array<{ content: string; role: string }>, options: GatekeeperOptions = {}) {
    return this.extract(messages, options);
  }
}
