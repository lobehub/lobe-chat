import { KnowledgeBaseExecutionRuntime as BaseKnowledgeBaseExecutionRuntime } from '@lobechat/builtin-tool-knowledge-base/executionRuntime';

import { ragService } from '@/services/rag';

// Create a factory that returns an instance with ragService injected
export class KnowledgeBaseExecutionRuntime extends BaseKnowledgeBaseExecutionRuntime {
  constructor() {
    super(ragService);
  }
}

// Re-export types for convenience
export type { ReadKnowledgeArgs } from '@lobechat/builtin-tool-knowledge-base';
