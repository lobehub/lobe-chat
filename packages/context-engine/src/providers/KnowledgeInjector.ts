import { promptAgentKnowledge } from '@lobechat/prompts';
import type { FileContent, KnowledgeBaseInfo } from '@lobechat/prompts';
import debug from 'debug';

import { BaseProvider } from '../base/BaseProvider';
import type { PipelineContext, ProcessorOptions } from '../types';

const log = debug('context-engine:provider:KnowledgeInjector');

export interface KnowledgeInjectorConfig {
  /** File contents to inject */
  fileContents?: FileContent[];
  /** Knowledge bases to inject */
  knowledgeBases?: KnowledgeBaseInfo[];
}

/**
 * Knowledge Injector
 * Responsible for injecting agent's knowledge (files and knowledge bases) into context
 */
export class KnowledgeInjector extends BaseProvider {
  readonly name = 'KnowledgeInjector';

  constructor(
    private config: KnowledgeInjectorConfig,
    options: ProcessorOptions = {},
  ) {
    super(options);
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    const clonedContext = this.cloneContext(context);

    const fileContents = this.config.fileContents || [];
    const knowledgeBases = this.config.knowledgeBases || [];

    // Generate unified knowledge prompt
    const formattedContent = promptAgentKnowledge({ fileContents, knowledgeBases });

    // Skip injection if no knowledge at all
    if (!formattedContent) {
      log('No knowledge to inject');
      return this.markAsExecuted(clonedContext);
    }

    // Find the first user message index
    const firstUserIndex = clonedContext.messages.findIndex((msg) => msg.role === 'user');

    if (firstUserIndex === -1) {
      log('No user messages found, skipping injection');
      return this.markAsExecuted(clonedContext);
    }

    // Insert a new user message with knowledge before the first user message
    // Mark it as application-level system injection
    const knowledgeMessage = {
      content: formattedContent,
      createdAt: Date.now(),
      id: `knowledge-${Date.now()}`,
      meta: { injectType: 'knowledge', systemInjection: true },
      role: 'user' as const,
      updatedAt: Date.now(),
    };

    clonedContext.messages.splice(firstUserIndex, 0, knowledgeMessage);

    // Update metadata
    clonedContext.metadata.knowledgeInjected = true;
    clonedContext.metadata.filesCount = fileContents.length;
    clonedContext.metadata.knowledgeBasesCount = knowledgeBases.length;

    log(
      `Agent knowledge injected as new user message: ${fileContents.length} file(s), ${knowledgeBases.length} knowledge base(s)`,
    );

    return this.markAsExecuted(clonedContext);
  }
}
