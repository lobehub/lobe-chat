import { DeepPartial } from 'utility-types';

import { SystemEmbeddingConfig } from '@/types/knowledgeBase';

export class FilesStore {
  readonly config: DeepPartial<SystemEmbeddingConfig>;
  constructor(config: DeepPartial<SystemEmbeddingConfig>) {
    this.config = config;
  }

  getEmbeddingProvider(): string {
    return this.config.embedding_model!!.provider!!;
  }

  getEmbeddingModel() {
    return this.config.embedding_model!!.model!!;
  }

  getEmbeddingCustomPrompt() {
    return this.config.embedding_model!!.customPrompt!!;
  }

  getEmbeddingEnabled() {
    return this.config.embedding_model!!.enabled!!;
  }
}
