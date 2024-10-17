import { Ollama } from 'ollama/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { LobeOllamaAI } from './index';

vi.mock('ollama/browser');

describe('LobeOllamaAI', () => {
  let ollamaAI: LobeOllamaAI;

  beforeEach(() => {
    ollamaAI = new LobeOllamaAI({ baseURL: 'https://example.com' });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should initialize Ollama client and baseURL with valid baseURL', () => {
      expect(ollamaAI['client']).toBeInstanceOf(Ollama);
      expect(ollamaAI.baseURL).toBe('https://example.com');
    });

    it('should throw AgentRuntimeError with invalid baseURL', () => {
      try {
        new LobeOllamaAI({ baseURL: 'invalid-url' });
      } catch (e) {
        expect(e).toEqual(AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidOllamaArgs));
      }
    });
  });

  describe('chat', () => {
    it('should call Ollama client chat method and return StreamingResponse', async () => {
      const chatMock = vi.fn().mockResolvedValue({});
      vi.mocked(Ollama.prototype.chat).mockImplementation(chatMock);

      const payload = {
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'model-id',
      };
      const options = { signal: new AbortController().signal };

      const response = await ollamaAI.chat(payload as any, options);

      expect(chatMock).toHaveBeenCalledWith({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'model-id',
        options: {
          frequency_penalty: undefined,
          presence_penalty: undefined,
          temperature: undefined,
          top_p: undefined,
        },
        stream: true,
      });
      expect(response).toBeInstanceOf(Response);
    });

    it('should throw AgentRuntimeError when Ollama client chat method throws an error', async () => {
      const errorMock = {
        message: 'Chat error',
        name: 'ChatError',
        status_code: 500,
      };
      vi.mocked(Ollama.prototype.chat).mockRejectedValue(errorMock);

      const payload = {
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'model-id',
      };

      try {
        await ollamaAI.chat(payload as any);
      } catch (e) {
        expect(e).toEqual(
          AgentRuntimeError.chat({
            error: errorMock,
            errorType: AgentRuntimeErrorType.OllamaBizError,
            provider: ModelProvider.Ollama,
          }),
        );
      }
    });

    it('should abort the request when signal aborts', async () => {
      const abortMock = vi.fn();
      vi.mocked(Ollama.prototype.abort).mockImplementation(abortMock);

      const payload = {
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'model-id',
      };
      const options = { signal: new AbortController().signal };

      ollamaAI.chat(payload as any, options);

      options.signal.dispatchEvent(new Event('abort'));

      expect(abortMock).toHaveBeenCalled();
    });

    it('temperature should be divided by two', async () => {
      const chatMock = vi.fn().mockResolvedValue({});
      vi.mocked(Ollama.prototype.chat).mockImplementation(chatMock);

      const payload = {
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'model-id',
        temperature: 0.7,
      };
      const options = { signal: new AbortController().signal };

      const response = await ollamaAI.chat(payload as any, options);

      expect(chatMock).toHaveBeenCalledWith({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'model-id',
        options: {
          frequency_penalty: undefined,
          presence_penalty: undefined,
          temperature: 0.35,
          top_p: undefined,
        },
        stream: true,
      });
      expect(response).toBeInstanceOf(Response);
    });
  });

  describe('embeddings', () => {
    it('should return an array of EmbeddingItems', async () => {
      // Arrange
      const mockEmbeddingItem = { embedding: [0.1, 0.2], index: 0, object: 'embedding' };

      const spy = vi
        .spyOn(ollamaAI as any, 'invokeEmbeddingModel')
        .mockResolvedValue(mockEmbeddingItem);

      // Act
      const result = await ollamaAI.embeddings({
        input: ['Hello'],
        dimensions: 128,
        model: 'test-model',
        index: 0,
      });

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(result).toEqual([mockEmbeddingItem]);
    });

    it('should call instance.embeddings with correct parameters', async () => {
      // Arrange
      const payload = {
        dimensions: 1024,
        index: 0,
        input: 'Hello',
        modelId: 'test-model',
        model: 'test-model', // Add the missing model property
      };

      const apiError = AgentRuntimeError.chat({
        error: {
          body: undefined,
          message: 'Unexpected end of JSON input',
          type: 'SyntaxError',
        },
        errorType: AgentRuntimeErrorType.ProviderBizError,
        provider: ModelProvider.Bedrock,
        region: 'us-west-2',
      });

      // 使用 vi.spyOn 来模拟 instance.embeddings 方法
      const spy = vi.spyOn(ollamaAI as any, 'invokeEmbeddingModel').mockRejectedValue(apiError);

      try {
        // Act
        await ollamaAI['invokeEmbeddingModel'](payload);
      } catch (e) {
        expect(e).toEqual(apiError);
      }
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('models', () => {
    it('should call Ollama client list method and return ChatModelCard array', async () => {
      const listMock = vi.fn().mockResolvedValue({
        models: [{ name: 'model-1' }, { name: 'model-2' }],
      });
      vi.mocked(Ollama.prototype.list).mockImplementation(listMock);

      const models = await ollamaAI.models();

      expect(listMock).toHaveBeenCalled();
      expect(models).toEqual([{ id: 'model-1' }, { id: 'model-2' }]);
    });
  });

  describe('buildOllamaMessages', () => {
    it('should convert OpenAIChatMessage array to OllamaMessage array', () => {
      const messages = [
        { content: 'Hello', role: 'user' },
        { content: 'Hi there!', role: 'assistant' },
      ];

      const ollamaMessages = ollamaAI['buildOllamaMessages'](messages as any);

      expect(ollamaMessages).toEqual([
        { content: 'Hello', role: 'user' },
        { content: 'Hi there!', role: 'assistant' },
      ]);
    });
  });

  describe('convertContentToOllamaMessage', () => {
    it('should convert string content to OllamaMessage', () => {
      const message = { content: 'Hello', role: 'user' };

      const ollamaMessage = ollamaAI['convertContentToOllamaMessage'](message as any);

      expect(ollamaMessage).toEqual({ content: 'Hello', role: 'user' });
    });

    it('should convert text content to OllamaMessage', () => {
      const message = {
        content: [{ type: 'text', text: 'Hello' }],
        role: 'user',
      };

      const ollamaMessage = ollamaAI['convertContentToOllamaMessage'](message as any);

      expect(ollamaMessage).toEqual({ content: 'Hello', role: 'user' });
    });

    it('should convert image_url content to OllamaMessage with images', () => {
      const message = {
        content: [
          {
            type: 'image_url',
            image_url: { url: 'data:image/png;base64,abc123' },
          },
        ],
        role: 'user',
      };

      const ollamaMessage = ollamaAI['convertContentToOllamaMessage'](message as any);

      expect(ollamaMessage).toEqual({
        content: '',
        role: 'user',
        images: ['abc123'],
      });
    });

    it('should ignore invalid image_url content', () => {
      const message = {
        content: [
          {
            type: 'image_url',
            image_url: { url: 'invalid-url' },
          },
        ],
        role: 'user',
      };

      const ollamaMessage = ollamaAI['convertContentToOllamaMessage'](message as any);

      expect(ollamaMessage).toEqual({
        content: '',
        role: 'user',
      });
    });
  });
});
