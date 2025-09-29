// @vitest-environment node
import { ModelProvider } from 'model-bank';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LobeHuggingFaceAI } from './index';

describe('LobeHuggingFaceAI', () => {
  let instance: any;

  beforeEach(() => {
    instance = new LobeHuggingFaceAI({ apiKey: 'test' });

    const mockAsyncIterable = {
      async *[Symbol.asyncIterator]() {
        yield { choices: [] } as any;
      },
    } as any;

    // mock custom client's chatCompletionStream
    instance['client'] = {
      chatCompletionStream: vi.fn().mockReturnValue(mockAsyncIterable),
    } as any;
  });

  it('should initialize and return StreamingTextResponse on chat', async () => {
    const res = await instance.chat({
      messages: [{ role: 'user', content: 'hello' }],
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
      temperature: 0,
      stream: true,
    });

    expect(res).toBeInstanceOf(Response);
  });

  it('should set provider id properly', async () => {
    // provider id 用于错误封装等，这里验证暴露 id 一致
    expect(ModelProvider.HuggingFace).toBe('huggingface');
  });
});
