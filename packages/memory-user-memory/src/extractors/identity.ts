import { renderPlaceholderTemplate } from '@lobechat/context-engine';

import { IdentityMemory, IdentityMemorySchema } from '../schemas';
import { ExtractorOptions, ExtractorTemplateProps } from '../types';
import { BaseMemoryExtractor } from './base';

export interface IdentityExtractorTemplateProps extends ExtractorTemplateProps {
  existingIdentitiesContext?: string;
}

export interface IdentityExtractorOptions extends ExtractorOptions {
  existingIdentitiesContext?: string;
}

export class IdentityExtractor extends BaseMemoryExtractor<
  IdentityMemory,
  IdentityExtractorTemplateProps,
  IdentityExtractorOptions
> {
  protected getPromptFileName(): string {
    return 'layers/identity.md';
  }

  protected getResultSchema() {
    return IdentityMemorySchema;
  }

  protected getTemplateProps(options: IdentityExtractorOptions) {
    return {
      availableCategories: options.availableCategories,
      existingIdentitiesContext: options.existingIdentitiesContext,
      language: options.language,
      retrievedContext: options.retrievedContexts?.join('\n\n') || 'No similar memories retrieved.',
      sessionDate: options.sessionDate,
      topK: options.topK,
      username: options.username,
    };
  }

  protected buildUserPrompt(options: IdentityExtractorOptions): string {
    if (!this.promptTemplate) {
      throw new Error('Prompt template not loaded');
    }

    return renderPlaceholderTemplate(this.promptTemplate!, this.getTemplateProps(options));
  }
}
