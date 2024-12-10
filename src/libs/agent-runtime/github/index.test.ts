// @vitest-environment node
import OpenAI from 'openai';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LobeOpenAICompatibleRuntime } from '@/libs/agent-runtime';
import { ModelProvider } from '@/libs/agent-runtime';
import { AgentRuntimeErrorType } from '@/libs/agent-runtime';

import * as debugStreamModule from '../utils/debugStream';
import { LobeGithubAI } from './index';

const provider = ModelProvider.Github;
const defaultBaseURL = 'https://models.inference.ai.azure.com';
const bizErrorType = AgentRuntimeErrorType.ProviderBizError;
const invalidErrorType = AgentRuntimeErrorType.InvalidGithubToken;

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: LobeOpenAICompatibleRuntime;

beforeEach(() => {
  instance = new LobeGithubAI({ apiKey: 'test' });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LobeGithubAI', () => {
  describe('init', () => {
    it('should correctly initialize with an API key', async () => {
      const instance = new LobeGithubAI({ apiKey: 'test_api_key' });
      expect(instance).toBeInstanceOf(LobeGithubAI);
      expect(instance.baseURL).toEqual(defaultBaseURL);
    });
  });

  describe('chat', () => {
    beforeEach(() => {
      // Use vi.spyOn to mock the chat.completions.create method
      vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
        new ReadableStream() as any,
      );
    });

    describe('Error', () => {
      it('should return GithubBizError with an openai error response when OpenAI.APIError is thrown', async () => {
        // Arrange
        const apiError = new OpenAI.APIError(
          400,
          {
            status: 400,
            error: {
              message: 'Bad Request',
            },
          },
          'Error message',
          {},
        );

        vi.spyOn(instance['client'].chat.completions, 'create').mockRejectedValue(apiError);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'meta-llama-3-70b-instruct',
            temperature: 0.7,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: defaultBaseURL,
            error: {
              error: { message: 'Bad Request' },
              status: 400,
            },
            errorType: bizErrorType,
            provider,
          });
        }
      });

      it('should throw AgentRuntimeError with InvalidGithubToken if no apiKey is provided', async () => {
        try {
          new LobeGithubAI({});
        } catch (e) {
          expect(e).toEqual({ errorType: invalidErrorType });
        }
      });

      it('should return GithubBizError with the cause when OpenAI.APIError is thrown with cause', async () => {
        // Arrange
        const errorInfo = {
          stack: 'abc',
          cause: {
            message: 'api is undefined',
          },
        };
        const apiError = new OpenAI.APIError(400, errorInfo, 'module error', {});

        vi.spyOn(instance['client'].chat.completions, 'create').mockRejectedValue(apiError);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'meta-llama-3-70b-instruct',
            temperature: 0.7,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: defaultBaseURL,
            error: {
              cause: { message: 'api is undefined' },
              stack: 'abc',
            },
            errorType: bizErrorType,
            provider,
          });
        }
      });

      it('should throw an InvalidGithubToken error type on 401 status code', async () => {
        // Mock the API call to simulate a 401 error
        const error = new Error('InvalidApiKey') as any;
        error.status = 401;
        vi.mocked(instance['client'].chat.completions.create).mockRejectedValue(error);

        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'meta-llama-3-70b-instruct',
            temperature: 0.7,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: defaultBaseURL,
            error: new Error('InvalidApiKey'),
            errorType: invalidErrorType,
            provider,
          });
        }
      });

      it('should return AgentRuntimeError for non-OpenAI errors', async () => {
        // Arrange
        const genericError = new Error('Generic Error');

        vi.spyOn(instance['client'].chat.completions, 'create').mockRejectedValue(genericError);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'meta-llama-3-70b-instruct',
            temperature: 0.7,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: defaultBaseURL,
            errorType: 'AgentRuntimeError',
            provider,
            error: {
              name: genericError.name,
              cause: genericError.cause,
              message: genericError.message,
              stack: genericError.stack,
            },
          });
        }
      });
    });

    describe('DEBUG', () => {
      it('should call debugStream and return StreamingTextResponse when DEBUG_GITHUB_CHAT_COMPLETION is 1', async () => {
        // Arrange
        const mockProdStream = new ReadableStream() as any;
        const mockDebugStream = new ReadableStream({
          start(controller) {
            controller.enqueue('Debug stream content');
            controller.close();
          },
        }) as any;
        mockDebugStream.toReadableStream = () => mockDebugStream;

        // mock
        (instance['client'].chat.completions.create as Mock).mockResolvedValue({
          tee: () => [mockProdStream, { toReadableStream: () => mockDebugStream }],
        });

        const originalDebugValue = process.env.DEBUG_GITHUB_CHAT_COMPLETION;

        process.env.DEBUG_GITHUB_CHAT_COMPLETION = '1';
        vi.spyOn(debugStreamModule, 'debugStream').mockImplementation(() => Promise.resolve());

        // 执行测试
        await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'meta-llama-3-70b-instruct',
          stream: true,
          temperature: 0.7,
        });

        // 验证 debugStream 被调用
        expect(debugStreamModule.debugStream).toHaveBeenCalled();

        // 恢复原始环境变量值
        process.env.DEBUG_GITHUB_CHAT_COMPLETION = originalDebugValue;
      });
    });
  });

  describe('models', () => {
    beforeEach(() => {});

    it('should return a list of models', async () => {
      // Arrange
      const arr = [
        {
          id: 'azureml://registries/azureml-ai21/models/AI21-Jamba-Instruct/versions/2',
          name: 'AI21-Jamba-Instruct',
          friendly_name: 'AI21-Jamba-Instruct',
          model_version: 2,
          publisher: 'AI21 Labs',
          model_family: 'AI21 Labs',
          model_registry: 'azureml-ai21',
          license: 'custom',
          task: 'chat-completion',
          description:
            "Jamba-Instruct is the world's first production-grade Mamba-based LLM model and leverages its hybrid Mamba-Transformer architecture to achieve best-in-class performance, quality, and cost efficiency.\n\n**Model Developer Name**: _AI21 Labs_\n\n## Model Architecture\n\nJamba-Instruct leverages a hybrid Mamba-Transformer architecture to achieve best-in-class performance, quality, and cost efficiency.\nAI21's Jamba architecture features a blocks-and-layers approach that allows Jamba to successfully integrate the two architectures. Each Jamba block contains either an attention or a Mamba layer, followed by a multi-layer perceptron (MLP), producing an overall ratio of one Transformer layer out of every eight total layers.\n",
          summary:
            "Jamba-Instruct is the world's first production-grade Mamba-based LLM model and leverages its hybrid Mamba-Transformer architecture to achieve best-in-class performance, quality, and cost efficiency.",
          tags: ['chat', 'rag'],
        },
        {
          id: 'azureml://registries/azureml-cohere/models/Cohere-command-r/versions/3',
          name: 'Cohere-command-r',
          friendly_name: 'Cohere Command R',
          model_version: 3,
          publisher: 'cohere',
          model_family: 'cohere',
          model_registry: 'azureml-cohere',
          license: 'custom',
          task: 'chat-completion',
          description:
            "Command R is a highly performant generative large language model, optimized for a variety of use cases including reasoning, summarization, and question answering. \n\nThe model is optimized to perform well in the following languages: English, French, Spanish, Italian, German, Brazilian Portuguese, Japanese, Korean, Simplified Chinese, and Arabic.\n\nPre-training data additionally included the following 13 languages: Russian, Polish, Turkish, Vietnamese, Dutch, Czech, Indonesian, Ukrainian, Romanian, Greek, Hindi, Hebrew, Persian.\n\n## Resources\n\nFor full details of this model, [release blog post](https://aka.ms/cohere-blog).\n\n## Model Architecture\n\nThis is an auto-regressive language model that uses an optimized transformer architecture. After pretraining, this model uses supervised fine-tuning (SFT) and preference training to align model behavior to human preferences for helpfulness and safety.\n\n### Tool use capabilities\n\nCommand R has been specifically trained with conversational tool use capabilities. These have been trained into the model via a mixture of supervised fine-tuning and preference fine-tuning, using a specific prompt template. Deviating from this prompt template will likely reduce performance, but we encourage experimentation.\n\nCommand R's tool use functionality takes a conversation as input (with an optional user-system preamble), along with a list of available tools. The model will then generate a json-formatted list of actions to execute on a subset of those tools. Command R may use one of its supplied tools more than once.\n\nThe model has been trained to recognise a special directly_answer tool, which it uses to indicate that it doesn't want to use any of its other tools. The ability to abstain from calling a specific tool can be useful in a range of situations, such as greeting a user, or asking clarifying questions. We recommend including the directly_answer tool, but it can be removed or renamed if required.\n\n### Grounded Generation and RAG Capabilities\n\nCommand R has been specifically trained with grounded generation capabilities. This means that it can generate responses based on a list of supplied document snippets, and it will include grounding spans (citations) in its response indicating the source of the information. This can be used to enable behaviors such as grounded summarization and the final step of Retrieval Augmented Generation (RAG).This behavior has been trained into the model via a mixture of supervised fine-tuning and preference fine-tuning, using a specific prompt template. Deviating from this prompt template may reduce performance, but we encourage experimentation.\n\nCommand R's grounded generation behavior takes a conversation as input (with an optional user-supplied system preamble, indicating task, context and desired output style), along with a list of retrieved document snippets. The document snippets should be chunks, rather than long documents, typically around 100-400 words per chunk. Document snippets consist of key-value pairs. The keys should be short descriptive strings, the values can be text or semi-structured.\n\nBy default, Command R will generate grounded responses by first predicting which documents are relevant, then predicting which ones it will cite, then generating an answer. Finally, it will then insert grounding spans into the answer. See below for an example. This is referred to as accurate grounded generation.\n\nThe model is trained with a number of other answering modes, which can be selected by prompt changes . A fast citation mode is supported in the tokenizer, which will directly generate an answer with grounding spans in it, without first writing the answer out in full. This sacrifices some grounding accuracy in favor of generating fewer tokens.\n\n### Code Capabilities\n\nCommand R has been optimized to interact with your code, by requesting code snippets, code explanations, or code rewrites. It might not perform well out-of-the-box for pure code completion. For better performance, we also recommend using a low temperature (and even greedy decoding) for code-generation related instructions.\n",
          summary:
            'Command R is a scalable generative model targeting RAG and Tool Use to enable production-scale AI for enterprise.',
          tags: ['rag', 'multilingual'],
        },
      ];
      vi.spyOn(instance['client'].models, 'list').mockResolvedValue({
        body: arr,
      } as any);

      // Act & Assert
      const models = await instance.models();

      const modelsCount = models.length;
      expect(modelsCount).toBe(arr.length);

      for (let i = 0; i < arr.length; i++) {
        const model = models[i];
        expect(model).toEqual({
          description: arr[i].description,
          displayName: arr[i].friendly_name,
          id: arr[i].name,
        });
      }
    });
  });
});
