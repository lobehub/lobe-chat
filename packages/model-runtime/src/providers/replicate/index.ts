import { ModelProvider } from 'model-bank';
import Replicate from 'replicate';

import {
  createSSEProtocolTransformer,
  createTokenSpeedCalculator,
  StreamContext,
  convertIterableToStream,
} from '../../core/streams/protocol';
import { LobeRuntimeAI } from '../../core/BaseAI';
import {
  type ChatCompletionErrorPayload,
  ChatMethodOptions,
  ChatStreamPayload,
} from '../../types';
import { AgentRuntimeErrorType } from '../../types/error';
import { AgentRuntimeError } from '../../utils/createError';
import { desensitizeUrl } from '../../utils/desensitizeUrl';
import { StreamingResponse } from '../../utils/response';

const DEFAULT_BASE_URL = 'https://api.replicate.com';

interface ReplicateAIParams {
  apiKey?: string;
  baseURL?: string;
  id?: string;
}

export class LobeReplicateAI implements LobeRuntimeAI {
  private client: Replicate;

  baseURL: string;
  apiKey?: string;
  private id: string;

  private isDebug() {
    return process.env.DEBUG_REPLICATE_CHAT_COMPLETION === '1';
  }

  constructor({ apiKey, baseURL = DEFAULT_BASE_URL, id }: ReplicateAIParams = {}) {
    if (!apiKey) {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);
    }

    this.client = new Replicate({
      auth: apiKey,
      useFileOutput: false, // Return URLs instead of binary data
    });

    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.id = id || ModelProvider.Replicate;
  }

  /**
   * Chat completion with streaming support
   */
  async chat(payload: ChatStreamPayload, options?: ChatMethodOptions): Promise<Response> {
    try {
      const { model, messages, temperature, max_tokens, top_p } = payload;
      const streamContext: StreamContext = { id: `replicate-${Date.now()}` };
      const inputStartAt = Date.now();

      // Extract prompt from messages
      const prompt = this.buildPromptFromMessages(messages);

      // Build input parameters for Replicate model
      const input: Record<string, any> = {
        prompt,
      };

      // Add optional parameters if present
      if (temperature !== undefined) input.temperature = temperature;
      if (max_tokens !== undefined) input.max_tokens = max_tokens;
      if (top_p !== undefined) input.top_p = top_p;

      if (this.isDebug()) {
        console.log('[Replicate Request]');
        console.log(JSON.stringify({ input, model }), '\n');
      }

      // Use replicate.stream() for streaming responses
      const stream = this.client.stream(model as any, { input });

      const transformReplicateEvent = (event: any, ctx: StreamContext) => {
        switch (event.event) {
        case 'output': {
          const text = typeof event.data === 'string' ? event.data : JSON.stringify(event.data);

          if (text) {
            // Replicate does not return token usage; estimate by character length
            const estimatedTokens = Math.ceil(text.length / 4);
            ctx.usage = ctx.usage || { totalOutputTokens: 0, totalTokens: 0 };
            ctx.usage.totalOutputTokens = (ctx.usage.totalOutputTokens || 0) + estimatedTokens;
            ctx.usage.totalTokens = (ctx.usage.totalTokens || 0) + estimatedTokens;
          }

          return { data: text, id: ctx.id, type: 'text' } as const;
        }

        case 'done': {
          const result = [];

          if (ctx.usage) {
            result.push({ data: ctx.usage, id: ctx.id, type: 'usage' } as const);
          }

          result.push({ data: 'stop', id: ctx.id, type: 'stop' } as const);

          return result;
        }

        case 'error': {
          const message =
            typeof event.data === 'string'
              ? event.data
              : (event?.data?.message as string) || 'Replicate streaming error';

          return {
            data: { body: event.data, message },
            id: ctx.id,
            type: 'error',
          } as const;
        }

        default:
          return { data: event, id: ctx.id, type: 'data' } as const;
        }
      };

      const readableStream = convertIterableToStream(stream)
        .pipeThrough(
          createTokenSpeedCalculator(transformReplicateEvent, {
            inputStartAt,
            streamStack: streamContext,
          }),
        )
        .pipeThrough(createSSEProtocolTransformer((c) => c, streamContext));

      return StreamingResponse(readableStream, {
        headers: options?.headers,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Image generation support for LobeChat async image generation (FLUX, Stable Diffusion, etc.)
   */
  async createImage(payload: any): Promise<any> {
    try {
      const { model, params } = payload;
      const { prompt, width, height, cfg, steps, seed, imageUrl, aspectRatio } = params;

      console.log('[Replicate createImage] === START ===');
      console.log('[Replicate createImage] Model:', model);
      console.log('[Replicate createImage] Params received:', JSON.stringify(params, null, 2));

      const input: Record<string, any> = {};

      // Redux models don't use prompt - they only use the input image
      if (!model.includes('redux')) {
        input.prompt = prompt;
        console.log('[Replicate createImage] Added prompt:', prompt);
      } else {
        console.log('[Replicate createImage] Skipping prompt (Redux model)');
      }

      // Handle image-to-image models
      if (imageUrl) {
        console.log('[Replicate createImage] imageUrl provided:', imageUrl);

        // Determine the parameter name based on model type
        let imageParamName: string;
        if (model.includes('redux')) {
          imageParamName = 'redux_image';
          console.log('[Replicate createImage] Will map to redux_image');
        } else if (model.includes('canny') || model.includes('depth')) {
          imageParamName = 'control_image';
          console.log('[Replicate createImage] Will map to control_image');
        } else if (model.includes('fill')) {
          imageParamName = 'image';
          console.log('[Replicate createImage] Will map to image (fill)');
        } else {
          imageParamName = 'image';
          console.log('[Replicate createImage] Will map to image (generic)');
        }

        // Check if URL is accessible from internet or local
        const isLocalUrl =
          imageUrl.includes('localhost') ||
          imageUrl.includes('127.0.0.1') ||
          imageUrl.includes('.local') ||
          imageUrl.startsWith('http://192.168.') ||
          imageUrl.startsWith('http://10.') ||
          imageUrl.startsWith('http://172.');

        if (isLocalUrl) {
          console.log('[Replicate createImage] Local URL detected, will fetch and upload as data');
          try {
            // Fetch the image from local URL
            const { ssrfSafeFetch } = await import('ssrf-safe-fetch');
            const imageResponse = await ssrfSafeFetch(imageUrl, undefined, {
              allowPrivateIPAddress: true,
            });
            if (!imageResponse.ok) {
              throw new Error(
                `Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`,
              );
            }

            // Get image as buffer
            const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
            console.log(
              '[Replicate createImage] Fetched image, size:',
              imageBuffer.length,
              'bytes',
            );

            // Check size limit (100MB)
            if (imageBuffer.length > 100 * 1024 * 1024) {
              throw new Error(`Image too large: ${imageBuffer.length} bytes (max 100MB)`);
            }

            // Replicate SDK accepts Buffer objects directly
            input[imageParamName] = imageBuffer;
            console.log('[Replicate createImage] Mapped to', imageParamName, 'as Buffer');
          } catch (fetchError: any) {
            console.error('[Replicate createImage] Error fetching local image:', fetchError);
            throw new Error(`Failed to fetch local image: ${fetchError.message}`);
          }
        } else {
          // Public URL - use directly
          input[imageParamName] = imageUrl;
          console.log('[Replicate createImage] Public URL, mapped directly to', imageParamName);
        }
      } else {
        console.log('[Replicate createImage] No imageUrl provided');
      }

      // Map LobeChat params to Replicate params
      if (width && height) {
        input.width = width;
        input.height = height;
        console.log('[Replicate createImage] Set dimensions:', width, 'x', height);
      }

      // For FLUX models, convert to aspect_ratio
      if (model.includes('flux')) {
        // Use explicit aspectRatio if provided (for Redux models)
        if (aspectRatio) {
          input.aspect_ratio = aspectRatio;
          console.log('[Replicate createImage] Set aspect_ratio from param:', aspectRatio);
        } else if (width && height) {
          if (width === height) {
            input.aspect_ratio = '1:1';
          } else if (width === 1280 && height === 720) {
            input.aspect_ratio = '16:9';
          } else if (width === 720 && height === 1280) {
            input.aspect_ratio = '9:16';
          } else if (width > height) {
            input.aspect_ratio = '16:9';
          } else {
            input.aspect_ratio = '9:16';
          }
          console.log('[Replicate createImage] Calculated aspect_ratio:', input.aspect_ratio);
        }
        // Remove width/height for FLUX models (unless it's Fill which needs dimensions)
        if (!model.includes('fill')) {
          delete input.width;
          delete input.height;
          console.log('[Replicate createImage] Removed width/height (using aspect_ratio)');
        }
      }

      // Add optional parameters
      if (cfg !== undefined) {
        input.guidance_scale = cfg;
        console.log('[Replicate createImage] Set guidance_scale:', cfg);
      }
      if (steps !== undefined) {
        // Redux uses num_inference_steps, control models use steps
        if (model.includes('redux')) {
          input.num_inference_steps = steps;
          console.log('[Replicate createImage] Set num_inference_steps:', steps);
        } else if (model.includes('canny') || model.includes('depth') || model.includes('fill')) {
          input.steps = steps;
          console.log('[Replicate createImage] Set steps:', steps);
        } else {
          input.num_inference_steps = steps;
          console.log('[Replicate createImage] Set num_inference_steps:', steps);
        }
      }
      if (seed !== undefined && seed !== null) {
        input.seed = seed;
        console.log('[Replicate createImage] Set seed:', seed);
      }

      // Run prediction - with useFileOutput: false, returns URL strings
      // Log input object without Buffer data (which would be huge)
      const inputForLogging = { ...input };
      for (const key in inputForLogging) {
        if (Buffer.isBuffer(inputForLogging[key])) {
          inputForLogging[key] = `<Buffer ${inputForLogging[key].length} bytes>`;
        }
      }
      console.log(
        '[Replicate createImage] Final input object:',
        JSON.stringify(inputForLogging, null, 2),
      );
      console.log('[Replicate createImage] Calling client.run...');

      const output = await this.client.run(model as any, { input });

      console.log('[Replicate createImage] Raw output:', output);
      console.log(
        '[Replicate createImage] Output type:',
        typeof output,
        'Is array:',
        Array.isArray(output),
      );

      // Extract URL from output
      let outputImageUrl: string;

      if (Array.isArray(output)) {
        if (output.length === 0) {
          throw new Error('Replicate returned empty array');
        }
        // First item should be the URL string
        outputImageUrl = output[0];
        console.log('[Replicate] Extracted URL from array:', outputImageUrl);
      } else if (typeof output === 'string') {
        outputImageUrl = output;
        console.log('[Replicate] Output is direct string URL:', outputImageUrl);
      } else {
        console.error('[Replicate] Unexpected output structure:', output);
        throw new Error(`Unexpected output format from Replicate: ${typeof output}`);
      }

      if (typeof outputImageUrl !== 'string') {
        throw new Error(`Expected URL string, got ${typeof outputImageUrl}: ${outputImageUrl}`);
      }

      console.log('[Replicate] Final imageUrl:', outputImageUrl);

      return {
        height: height,
        imageUrl: outputImageUrl,
        width: width,
      };
    } catch (error) {
      console.error('[Replicate createImage] ERROR caught:', error);
      console.error('[Replicate createImage] Error type:', (error as any)?.constructor?.name);
      console.error('[Replicate createImage] Error message:', (error as any)?.message);
      console.error('[Replicate createImage] Full error:', JSON.stringify(error, null, 2));
      throw this.handleError(error);
    }
  }

  /**
   * List available models from Replicate collections
   */
  async models() {
    try {
      // Only fetch text-generation models for chat
      const collections = ['text-generation'];

      const models: Array<{ created: number; displayName: string; id: string }> = [];

      for (const collection of collections) {
        try {
          const response = await fetch(`https://api.replicate.com/v1/collections/${collection}`, {
            headers: {
              Authorization: `Token ${this.apiKey}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.models && Array.isArray(data.models)) {
              data.models.slice(0, 30).forEach((model: any) => {
                // Format: owner/name or full model reference
                const modelId = model.url
                  ? model.url.replace('https://replicate.com/', '')
                  : `${model.owner}/${model.name}`;

                models.push({
                  created: new Date(model.created_at || Date.now()).getTime() / 1000,
                  displayName: model.name || model.default_example?.model || modelId,
                  id: modelId,
                });
              });
            }
          }
        } catch (collectionError) {
          console.warn(`Failed to fetch ${collection} collection:`, collectionError);
        }
      }

      // If API fetch fails or returns nothing, return predefined list
      if (models.length === 0) {
        return [
          {
            created: 0,
            displayName: 'Llama 2 70B Chat',
            id: 'meta/llama-2-70b-chat',
          },
          {
            created: 0,
            displayName: 'Mistral 7B Instruct',
            id: 'mistralai/mistral-7b-instruct-v0.2',
          },
          {
            created: 0,
            displayName: 'FLUX 1.1 Pro',
            id: 'black-forest-labs/flux-1.1-pro',
          },
          {
            created: 0,
            displayName: 'Stable Diffusion XL',
            id: 'stability-ai/sdxl',
          },
        ];
      }

      return models;
    } catch (error) {
      console.error('Error fetching Replicate models:', error);
      // Return fallback list
      return [
        {
          created: 0,
          displayName: 'Llama 2 70B Chat',
          id: 'meta/llama-2-70b-chat',
        },
        {
          created: 0,
          displayName: 'Mistral 7B Instruct',
          id: 'mistralai/mistral-7b-instruct-v0.2',
        },
        {
          created: 0,
          displayName: 'FLUX 1.1 Pro',
          id: 'black-forest-labs/flux-1.1-pro',
        },
        {
          created: 0,
          displayName: 'Stable Diffusion XL',
          id: 'stability-ai/sdxl',
        },
      ];
    }
  }

  /**
   * Build prompt string from message array
   */
  private buildPromptFromMessages(messages: any[]): string {
    // Filter out system messages and concatenate user/assistant messages
    const conversationText = messages
      .filter((m) => m.role !== 'system')
      .map((m) => {
        const role = m.role === 'user' ? 'User' : 'Assistant';
        const content = typeof m.content === 'string' ? m.content : '';
        return `${role}: ${content}`;
      })
      .join('\n\n');

    // Add system message as prefix if exists
    const systemMessage = messages.find((m) => m.role === 'system');
    if (systemMessage && typeof systemMessage.content === 'string') {
      return `${systemMessage.content}\n\n${conversationText}`;
    }

    return conversationText;
  }

  /**
   * Error handling
   */
  private handleError(error: any): ChatCompletionErrorPayload {
    let desensitizedEndpoint = this.baseURL;

    if (this.baseURL !== DEFAULT_BASE_URL) {
      desensitizedEndpoint = desensitizeUrl(this.baseURL);
    }

    // Handle authentication errors
    if (error?.message?.includes('authentication') || error?.message?.includes('API token')) {
      throw AgentRuntimeError.chat({
        endpoint: desensitizedEndpoint,
        error: error as any,
        errorType: AgentRuntimeErrorType.InvalidProviderAPIKey,
        provider: this.id,
      });
    }

    // Handle model not found
    if (error?.message?.includes('not found')) {
      throw AgentRuntimeError.chat({
        endpoint: desensitizedEndpoint,
        error: error as any,
        errorType: AgentRuntimeErrorType.ModelNotFound,
        provider: this.id,
      });
    }

    // Generic error
    throw AgentRuntimeError.chat({
      endpoint: desensitizedEndpoint,
      error: error,
      errorType: AgentRuntimeErrorType.ProviderBizError,
      provider: this.id,
    });
  }
}

export default LobeReplicateAI;
