// @vitest-environment node
import { InvokeModelWithResponseStreamCommand } from '@aws-sdk/client-bedrock-runtime';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AgentRuntimeErrorType, ModelProvider } from '@/libs/agent-runtime';

import * as debugStreamModule from '../utils/debugStream';
import { LobeBedrockAI } from './index';

const provider = 'bedrock';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

vi.mock('@aws-sdk/client-bedrock-runtime', async (importOriginal) => {
  const module = await importOriginal();
  return {
    ...(module as any),
    InvokeModelWithResponseStreamCommand: vi.fn(),
  };
});

let instance: LobeBedrockAI;

beforeEach(() => {
  instance = new LobeBedrockAI({
    region: 'us-west-2',
    accessKeyId: 'test-access-key-id',
    accessKeySecret: 'test-access-key-secret',
  });

  vi.spyOn(instance['client'], 'send').mockReturnValue(new ReadableStream() as any);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LobeBedrockAI', () => {
  describe('init', () => {
    it('should correctly initialize with AWS credentials', async () => {
      const instance = new LobeBedrockAI({
        region: 'us-west-2',
        accessKeyId: 'test-access-key-id',
        accessKeySecret: 'test-access-key-secret',
      });
      expect(instance).toBeInstanceOf(LobeBedrockAI);
    });
  });

  describe('chat', () => {
    it('should call invokeLlamaModel when model starts with "meta"', async () => {
      // @ts-ignore
      const spy = vi.spyOn(instance, 'invokeLlamaModel');

      // Act
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'meta.llama:1',
        temperature: 0,
      });

      // Assert
      expect(spy).toHaveBeenCalled();
    });

    it('should call invokeClaudeModel when model does not start with "meta"', async () => {
      // @ts-ignore
      const spy = vi.spyOn(instance, 'invokeClaudeModel');

      // Act
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'anthropic.claude-v2:1',
        temperature: 0,
      });

      // Assert
      expect(spy).toHaveBeenCalled();
    });

    describe('Claude model', () => {
      it('should return a Response on successful API call', async () => {
        const result = await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'anthropic.claude-v2:1',
          temperature: 0,
        });

        // Assert
        expect(result).toBeInstanceOf(Response);
      });

      it('should handle text messages correctly', async () => {
        // Arrange
        const mockStream = new ReadableStream({
          start(controller) {
            controller.enqueue('Hello, world!');
            controller.close();
          },
        });
        const mockResponse = Promise.resolve(mockStream);
        (instance['client'].send as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'anthropic.claude-v2:1',
          temperature: 0,
          top_p: 1,
        });

        // Assert
        expect(InvokeModelWithResponseStreamCommand).toHaveBeenCalledWith({
          accept: 'application/json',
          body: JSON.stringify({
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 4096,
            messages: [{ content: 'Hello', role: 'user' }],
            temperature: 0,
            top_p: 1,
          }),
          contentType: 'application/json',
          modelId: 'anthropic.claude-v2:1',
        });
        expect(result).toBeInstanceOf(Response);
      });

      it('should handle system prompt correctly', async () => {
        // Arrange
        const mockStream = new ReadableStream({
          start(controller) {
            controller.enqueue('Hello, world!');
            controller.close();
          },
        });
        const mockResponse = Promise.resolve(mockStream);
        (instance['client'].send as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await instance.chat({
          messages: [
            { content: 'You are an awesome greeter', role: 'system' },
            { content: 'Hello', role: 'user' },
          ],
          model: 'anthropic.claude-v2:1',
          temperature: 0,
          top_p: 1,
        });

        // Assert
        expect(InvokeModelWithResponseStreamCommand).toHaveBeenCalledWith({
          accept: 'application/json',
          body: JSON.stringify({
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 4096,
            messages: [{ content: 'Hello', role: 'user' }],
            system: 'You are an awesome greeter',
            temperature: 0,
            top_p: 1,
          }),
          contentType: 'application/json',
          modelId: 'anthropic.claude-v2:1',
        });
        expect(result).toBeInstanceOf(Response);
      });

      it('should call Anthropic model with supported opions', async () => {
        // Arrange
        const mockStream = new ReadableStream({
          start(controller) {
            controller.enqueue('Hello, world!');
            controller.close();
          },
        });
        const mockResponse = Promise.resolve(mockStream);
        (instance['client'].send as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await instance.chat({
          max_tokens: 2048,
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'anthropic.claude-v2:1',
          temperature: 0.5,
          top_p: 1,
        });

        // Assert
        expect(InvokeModelWithResponseStreamCommand).toHaveBeenCalledWith({
          accept: 'application/json',
          body: JSON.stringify({
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 2048,
            messages: [{ content: 'Hello', role: 'user' }],
            temperature: 0.5,
            top_p: 1,
          }),
          contentType: 'application/json',
          modelId: 'anthropic.claude-v2:1',
        });
        expect(result).toBeInstanceOf(Response);
      });

      it('should call Anthropic model without unsupported opions', async () => {
        // Arrange
        const mockStream = new ReadableStream({
          start(controller) {
            controller.enqueue('Hello, world!');
            controller.close();
          },
        });
        const mockResponse = Promise.resolve(mockStream);
        (instance['client'].send as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await instance.chat({
          frequency_penalty: 0.5, // Unsupported option
          max_tokens: 2048,
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'anthropic.claude-v2:1',
          presence_penalty: 0.5,
          temperature: 0.5,
          top_p: 1,
        });

        // Assert
        expect(InvokeModelWithResponseStreamCommand).toHaveBeenCalledWith({
          accept: 'application/json',
          body: JSON.stringify({
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 2048,
            messages: [{ content: 'Hello', role: 'user' }],
            temperature: 0.5,
            top_p: 1,
          }),
          contentType: 'application/json',
          modelId: 'anthropic.claude-v2:1',
        });
        expect(result).toBeInstanceOf(Response);
      });

      it('should call debugStream when DEBUG_BEDROCK_CHAT_COMPLETION is set to "1"', async () => {
        // Arrange
        process.env.DEBUG_BEDROCK_CHAT_COMPLETION = '1';
        const spy = vi.spyOn(debugStreamModule, 'debugStream');

        // Act
        await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'anthropic.claude-v2:1',
          temperature: 0,
        });

        // Assert
        expect(spy).toHaveBeenCalled();

        // Clean up
        delete process.env.DEBUG_BEDROCK_CHAT_COMPLETION;
      });

      it('should handle errors and throw AgentRuntimeError', async () => {
        // Arrange
        const errorMessage = 'An error occurred';
        const errorMetadata = { statusCode: 500 };
        const mockError = new Error(errorMessage);
        (mockError as any).$metadata = errorMetadata;
        (instance['client'].send as Mock).mockRejectedValue(mockError);

        // Act & Assert
        await expect(
          instance.chat({
            max_tokens: 100,
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'anthropic.claude-v2:1',
            temperature: 0,
          }),
        ).rejects.toThrow(
          expect.objectContaining({
            error: {
              body: errorMetadata,
              message: errorMessage,
              type: 'Error',
            },
            errorType: AgentRuntimeErrorType.BedrockBizError,
            provider: ModelProvider.Bedrock,
            region: 'us-west-2',
          }),
        );
      });
    });

    describe('Llama Model', () => {
      it('should call Llama model with valid payload', async () => {
        // Arrange
        const mockStream = new ReadableStream({
          start(controller) {
            controller.enqueue('Hello, world!');
            controller.close();
          },
        });
        const mockResponse = Promise.resolve(mockStream);
        (instance['client'].send as Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await instance.chat({
          temperature: 0,
          max_tokens: 100,
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'meta.llama:1',
        });

        // Assert
        expect(InvokeModelWithResponseStreamCommand).toHaveBeenCalledWith({
          accept: 'application/json',
          body: JSON.stringify({
            max_gen_len: 100,
            prompt: '<s>[INST] Hello [/INST]',
          }),
          contentType: 'application/json',
          modelId: 'meta.llama:1',
        });
        expect(result).toBeInstanceOf(Response);
      });

      it('should handle errors and throw AgentRuntimeError', async () => {
        // Arrange
        const errorMessage = 'An error occurred';
        const errorMetadata = { statusCode: 500 };
        const mockError = new Error(errorMessage);
        (mockError as any).$metadata = errorMetadata;
        (instance['client'].send as Mock).mockRejectedValue(mockError);

        // Act & Assert
        await expect(
          instance.chat({
            max_tokens: 100,
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'meta.llama:1',
            temperature: 0,
          }),
        ).rejects.toThrow(
          expect.objectContaining({
            error: {
              body: errorMetadata,
              message: errorMessage,
              region: 'us-west-2',
              type: 'Error',
            },
            errorType: AgentRuntimeErrorType.BedrockBizError,
            provider: ModelProvider.Bedrock,
            region: 'us-west-2',
          }),
        );
      });

      it('should call debugStream when DEBUG_BEDROCK_CHAT_COMPLETION is set to "1"', async () => {
        // Arrange
        process.env.DEBUG_BEDROCK_CHAT_COMPLETION = '1';
        const spy = vi.spyOn(debugStreamModule, 'debugStream');

        // Act
        await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'meta.llama:1',
          temperature: 0,
        });

        // Assert
        expect(spy).toHaveBeenCalled();

        // Clean up
        delete process.env.DEBUG_BEDROCK_CHAT_COMPLETION;
      });
    });

    it('should call options.callback when provided', async () => {
      // Arrange
      const onStart = vi.fn();

      // Act
      await instance.chat(
        {
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'anthropic.claude-v2:1',
          temperature: 0,
        },
        { callback: { onStart } },
      );

      // Assert
      expect(onStart).toHaveBeenCalled();
    });
  });
});
