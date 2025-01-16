import { describe, expect, it } from 'vitest';

import { parseFilesConfig } from './parseFilesConfig';

describe('parseFilesConfig', () => {
  it('parses full configuration correctly', () => {
    const envStr =
      'embedding_model=openai/embedding-text-3-small,reranker_model=cohere/rerank-english-v3.0,query_mode=full_text';
    const expected = {
      embeddingModel: { provider: 'openai', model: 'embedding-text-3-small' },
      rerankerModel: { provider: 'cohere', model: 'rerank-english-v3.0' },
      queryMode: 'full_text',
    };
    expect(parseFilesConfig(envStr)).toEqual(expected);
  });

  // 测试embeddings配置是否被正确解析
  it('parses embeddings configuration correctly', () => {
    const envStr = 'embedding_model=openai/embedding-text-3-large';
    const expected = {
      embeddingModel: { provider: 'openai', model: 'embedding-text-3-large' },
    };
    expect(parseFilesConfig(envStr)).toEqual(expected);
  });

  it('parses rerank configuration correctly', () => {
    const envStr = 'reranker_model=cohere/rerank-english-v3.0';
    const expected = {
      rerankerModel: { provider: 'cohere', model: 'rerank-english-v3.0' },
    };
    expect(parseFilesConfig(envStr)).toEqual(expected);
  });

  it('parses queryMode configuration correctly', () => {
    const envStr = 'query_mode=full_text';
    const expected = {
      queryMode: 'full_text',
    };
    expect(parseFilesConfig(envStr)).toEqual(expected);
  });

  it('parses queryMode rerank configuration correctly', () => {
    const envStr = 'reranker_model=cohere/rerank-english-v3.0,query_mode=full_text';
    const expected = {
      queryMode: 'full_text',
      rerankerModel: { provider: 'cohere', model: 'rerank-english-v3.0' },
    };
    expect(parseFilesConfig(envStr)).toEqual(expected);
  });

  it('parses queryMode embeddings configuration correctly', () => {
    const envStr = 'embedding_model=openai/embedding-text-3-small,query_mode=full_text';
    const expected = {
      queryMode: 'full_text',
      embeddingModel: { provider: 'openai', model: 'embedding-text-3-small' },
    };
    expect(parseFilesConfig(envStr)).toEqual(expected);
  });

  it('parses rerank embeddings configuration correctly', () => {
    const envStr =
      'reranker_model=cohere/rerank-english-v3.0,embedding_model=openai/embedding-text-3-small';
    const expected = {
      embeddingModel: { provider: 'openai', model: 'embedding-text-3-small' },
      rerankerModel: { provider: 'cohere', model: 'rerank-english-v3.0' },
    };
    expect(parseFilesConfig(envStr)).toEqual(expected);
  });
});
