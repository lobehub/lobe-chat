import { describe, expect, it } from 'vitest';

import { parseFilesConfig } from './parseFilesConfig';

describe('parseFilesConfig', () => {
  // 测试embeddings配置是否被正确解析
  it('parses embeddings configuration correctly', () => {
    const envStr =
      'embedding_model=openai/embedding-text-3-large,reranker_model=cohere/rerank-english-v3.0,query_model=full_text';
    const expected = {
      embedding_model: { provider: 'openai', model: 'embedding-text-3-large' },
      reranker_model: { provider: 'cohere', model: 'rerank-english-v3.0' },
      query_model: 'full_text',
    };
    expect(parseFilesConfig(envStr)).toEqual(expected);
  });
});
