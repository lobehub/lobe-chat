import { e } from 'vitest/dist/reporters-1evA5lom.js';

import { FilesStore } from '.';

describe('checkEmbedVars', () => {
  it('should return the provider', () => {
    const config = {
      embedding_model: {
        provider: 'provider',
      },
    };
    const filesStore = new FilesStore(config);
    expect(filesStore.getEmbeddingProvider()).toBe('provider');
  });
  it('should return the model', () => {
    const config = {
      embedding_model: {
        model: 'model',
      },
    };
    const filesStore = new FilesStore(config);
    expect(filesStore.getEmbeddingModel()).toBe('model');
  });
  it('should return the provider is enabled', () => {
    const config = {
      embedding_model: {
        enabled: true,
      },
    };
    const filesStore = new FilesStore(config);
    expect(filesStore.getEmbeddingEnabled()).toBe(true);
  });
  it('should return the custom prompt', () => {
    const config = {
      embedding_model: {
        customPrompt: 'customPrompt',
      },
    };
    const filesStore = new FilesStore(config);
    expect(filesStore.getEmbeddingCustomPrompt()).toBe('customPrompt');
  });
});
