import type { GenerateObjectSchema } from '@lobechat/model-runtime';

import { GatekeeperResult, GatekeeperResultSchema } from '../schemas';
import { GatekeeperOptions } from '../types';
import { BaseMemoryExtractor } from './base';

export class UserMemoryGateKeeper extends BaseMemoryExtractor<GatekeeperResult, GatekeeperOptions> {
  protected getPromptFileName(): string {
    return 'gatekeeper.md';
  }

  protected getSchema(): GenerateObjectSchema {
    const layerDecision = {
      additionalProperties: false,
      properties: {
        reasoning: { type: 'string' },
        shouldExtract: { type: 'boolean' },
      },
      required: ['reasoning', 'shouldExtract'],
      type: 'object',
    } as const;

    return {
      name: 'gatekeeper_decision',
      schema: {
        additionalProperties: false,
        properties: {
          activity: layerDecision,
          context: layerDecision,
          experience: layerDecision,
          identity: layerDecision,
          preference: layerDecision,
        },
        required: ['activity', 'context', 'experience', 'identity', 'preference'],
        type: 'object' as const,
      },
      strict: true,
    };
  }

  protected getResultSchema() {
    return GatekeeperResultSchema;
  }

  protected getTemplateProps(options: GatekeeperOptions) {
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

  async check(messages: Parameters<this['extract']>[0], options: GatekeeperOptions = {}) {
    return this.extract(messages, options);
  }
}
