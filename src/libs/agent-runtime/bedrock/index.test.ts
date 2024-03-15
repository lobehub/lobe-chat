// @vitest-environment node
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';
import * as debugStreamModule from '../utils/debugStream';
import { LobeBedrockAI } from './index';

const provider = 'bedrock';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

vi.mock("@aws-sdk/client-bedrock-runtime", async (importOriginal) => {
  const module = await importOriginal();
  return {
    ...(module as any),
    InvokeModelWithResponseStreamCommand: vi.fn()
  }
})

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
            anthropic_version: "bedrock-2023-05-31",
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
            anthropic_version: "bedrock-2023-05-31",
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
            anthropic_version: "bedrock-2023-05-31",
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
            anthropic_version: "bedrock-2023-05-31",
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

    });

  });
});
