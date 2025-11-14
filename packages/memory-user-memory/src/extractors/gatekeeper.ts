import { GatekeeperResult, GatekeeperResultSchema } from '../schemas';
import { GatekeeperOptions } from '../types';
import { buildGenerateObjectSchema } from '../utils/zod';
import { BaseMemoryExtractor } from './base';

export class UserMemoryGateKeeper extends BaseMemoryExtractor<GatekeeperResult, GatekeeperOptions> {
  protected getPromptFileName(): string {
    return 'gatekeeper.md';
  }

  protected getSchema() {
    return buildGenerateObjectSchema(GatekeeperResultSchema, {
      name: 'gatekeeper_decision',
    });
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
