import { ModelProvider } from 'model-bank';
import Replicate from 'replicate';

import { LobeRuntimeAI } from '../../core/BaseAI';
import {
  type ChatCompletionErrorPayload,
  ChatMethodOptions,
  ChatStreamPayload,
  TextToImagePayload,
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

  /**
   * Debug logger that gates verbose logging behind environment flags
   * to avoid noise and potential data leakage in production
   */
  private debugLog(...args: any[]) {
    const isReplicateDebug =
      process.env.DEBUG_REPLICATE === '1' ||
      process.env.DEBUG_REPLICATE_CHAT_COMPLETION === '1' ||
      process.env.NODE_ENV !== 'production';

    if (!isReplicateDebug) return;

    // eslint-disable-next-line no-console
    console.log(...args);
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
        this.debugLog('[Replicate Request]');
        this.debugLog(JSON.stringify({ input, model }), '\n');
      }

      // Use replicate.stream() for streaming responses
      const stream = this.client.stream(model as any, { input });

      // Convert Replicate stream to Server-Sent Events (SSE) format
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of stream) {
              switch (event.event) {
                case 'output': {
                  // Format as SSE compatible with LobeChat
                  const chunk = {
                    choices: [
                      {
                        delta: { content: event.data },
                        finish_reason: null,
                        index: 0,
                      },
                    ],
                    created: Math.floor(Date.now() / 1000),
                    id: `chatcmpl-${Date.now()}`,
                    model: model,
                    object: 'chat.completion.chunk',
                  };

                  controller.enqueue(
                    new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`),
                  );

                  break;
                }
                case 'done': {
                  // Send final chunk
                  const finalChunk = {
                    choices: [
                      {
                        delta: {},
                        finish_reason: 'stop',
                        index: 0,
                      },
                    ],
                    created: Math.floor(Date.now() / 1000),
                    id: `chatcmpl-${Date.now()}`,
                    model: model,
                    object: 'chat.completion.chunk',
                  };

                  controller.enqueue(
                    new TextEncoder().encode(`data: ${JSON.stringify(finalChunk)}\n\n`),
                  );
                  controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                  controller.close();

                  break;
                }
                case 'error': {
                  controller.error(new Error(JSON.stringify(event.data)));

                  break;
                }
                // No default
              }
            }
          } catch (error) {
            controller.error(error);
          }
        },
      });

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

      this.debugLog('[Replicate createImage] === START ===');
      this.debugLog('[Replicate createImage] Model:', model);
      this.debugLog('[Replicate createImage] Params received:', JSON.stringify(params, null, 2));

      const input: Record<string, any> = {};

      // Redux models don't use prompt - they only use the input image
      if (!model.includes('redux')) {
        input.prompt = prompt;
        this.debugLog('[Replicate createImage] Added prompt:', prompt);
      } else {
        this.debugLog('[Replicate createImage] Skipping prompt (Redux model)');
      }

      // Handle image-to-image models
      if (imageUrl) {
        this.debugLog('[Replicate createImage] imageUrl provided:', imageUrl);

        // Determine the parameter name based on model type
        let imageParamName: string;
        if (model.includes('redux')) {
          imageParamName = 'redux_image';
          this.debugLog('[Replicate createImage] Will map to redux_image');
        } else if (model.includes('canny') || model.includes('depth')) {
          imageParamName = 'control_image';
          this.debugLog('[Replicate createImage] Will map to control_image');
        } else if (model.includes('fill')) {
          imageParamName = 'image';
          this.debugLog('[Replicate createImage] Will map to image (fill)');
        } else {
          imageParamName = 'image';
          this.debugLog('[Replicate createImage] Will map to image (generic)');
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
          this.debugLog(
            '[Replicate createImage] Local URL detected, will fetch and upload as data',
          );
          try {
            // Fetch the image from local URL
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
              throw new Error(
                `Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`,
              );
            }

            // Get image as buffer
            const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
            this.debugLog(
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
            this.debugLog('[Replicate createImage] Mapped to', imageParamName, 'as Buffer');
          } catch (fetchError: any) {
            // eslint-disable-next-line no-console
            // eslint-disable-next-line no-console
            console.error(
              '[Replicate createImage] Error fetching local image:',
              fetchError.message,
            );
            throw new Error(`Failed to fetch local image: ${fetchError.message}`);
          }
        } else {
          // Public URL - use directly
          input[imageParamName] = imageUrl;
          this.debugLog('[Replicate createImage] Public URL, mapped directly to', imageParamName);
        }
      } else {
        this.debugLog('[Replicate createImage] No imageUrl provided');
      }

      // Map LobeChat params to Replicate params
      if (width && height) {
        input.width = width;
        input.height = height;
        this.debugLog('[Replicate createImage] Set dimensions:', width, 'x', height);
      }

      // For FLUX models, convert to aspect_ratio
      if (model.includes('flux')) {
        // Use explicit aspectRatio if provided (for Redux models)
        if (aspectRatio) {
          input.aspect_ratio = aspectRatio;
          this.debugLog('[Replicate createImage] Set aspect_ratio from param:', aspectRatio);
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
          this.debugLog('[Replicate createImage] Calculated aspect_ratio:', input.aspect_ratio);
        }
        // Remove width/height for FLUX models (unless it's Fill which needs dimensions)
        if (!model.includes('fill')) {
          delete input.width;
          delete input.height;
          this.debugLog('[Replicate createImage] Removed width/height (using aspect_ratio)');
        }
      }

      // Add optional parameters
      if (cfg !== undefined) {
        input.guidance_scale = cfg;
        this.debugLog('[Replicate createImage] Set guidance_scale:', cfg);
      }
      if (steps !== undefined) {
        // Redux uses num_inference_steps, control models use steps
        if (model.includes('redux')) {
          input.num_inference_steps = steps;
          this.debugLog('[Replicate createImage] Set num_inference_steps:', steps);
        } else if (model.includes('canny') || model.includes('depth') || model.includes('fill')) {
          input.steps = steps;
          this.debugLog('[Replicate createImage] Set steps:', steps);
        } else {
          input.num_inference_steps = steps;
          this.debugLog('[Replicate createImage] Set num_inference_steps:', steps);
        }
      }
      if (seed !== undefined && seed !== null) {
        input.seed = seed;
        this.debugLog('[Replicate createImage] Set seed:', seed);
      }

      // Run prediction - with useFileOutput: false, returns URL strings
      // Log input object without Buffer data (which would be huge)
      const inputForLogging = { ...input };
      for (const key in inputForLogging) {
        if (Buffer.isBuffer(inputForLogging[key])) {
          inputForLogging[key] = `<Buffer ${inputForLogging[key].length} bytes>`;
        }
      }
      this.debugLog(
        '[Replicate createImage] Final input object:',
        JSON.stringify(inputForLogging, null, 2),
      );
      this.debugLog('[Replicate createImage] Calling client.run...');

      const output = await this.client.run(model as any, { input });

      this.debugLog('[Replicate createImage] Raw output:', output);
      this.debugLog(
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
        this.debugLog('[Replicate] Extracted URL from array:', outputImageUrl);
      } else if (typeof output === 'string') {
        outputImageUrl = output;
        this.debugLog('[Replicate] Output is direct string URL:', outputImageUrl);
      } else {
        // eslint-disable-next-line no-console
        console.error('[Replicate] Unexpected output structure:', output);
        throw new Error(`Unexpected output format from Replicate: ${typeof output}`);
      }

      if (typeof outputImageUrl !== 'string') {
        throw new Error(`Expected URL string, got ${typeof outputImageUrl}: ${outputImageUrl}`);
      }

      this.debugLog('[Replicate] Final imageUrl:', outputImageUrl);

      return {
        height: height,
        imageUrl: outputImageUrl,
        width: width,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Replicate createImage] ERROR caught:', error);
      // eslint-disable-next-line no-console
      console.error('[Replicate createImage] Error type:', (error as any)?.constructor?.name);
      // eslint-disable-next-line no-console
      console.error('[Replicate createImage] Error message:', (error as any)?.message);
      // eslint-disable-next-line no-console
      console.error('[Replicate createImage] Full error:', JSON.stringify(error, null, 2));
      throw this.handleError(error);
    }
  }

  /**
   * Image generation support (FLUX, Stable Diffusion, etc.)
   */
  async textToImage(payload: TextToImagePayload): Promise<string[]> {
    try {
      const { prompt, model, size, n = 1 } = payload;

      const input: Record<string, any> = {
        prompt,
      };

      // Map size parameter if provided (e.g., "1024x1024" -> width/height)
      if (size) {
        const [width, height] = size.split('x').map(Number);
        if (width && height) {
          input.width = width;
          input.height = height;
        }
      }

      // For FLUX models, add aspect_ratio parameter
      if (
        model.includes('flux') && // Convert size to aspect ratio (e.g., "1024x1024" -> "1:1")
        size
      ) {
        const [w, h] = size.split('x').map(Number);
        if (w && h) {
          if (w === h) {
            input.aspect_ratio = '1:1';
          } else if (w === 1280 && h === 720) {
            input.aspect_ratio = '16:9';
          } else if (w === 720 && h === 1280) {
            input.aspect_ratio = '9:16';
          } else if (w > h) {
            input.aspect_ratio = '16:9';
          } else {
            input.aspect_ratio = '9:16';
          }
          // Remove width/height for FLUX models
          delete input.width;
          delete input.height;
        }
      }

      // Run prediction - with useFileOutput: false, returns URL strings
      this.debugLog('[Replicate] Calling client.run with:', JSON.stringify({ input, model }));
      const output = await this.client.run(model as any, { input });
      this.debugLog('[Replicate] Output:', output);
      this.debugLog('[Replicate] Output type:', typeof output, 'Is array:', Array.isArray(output));

      // Extract URLs from output
      if (Array.isArray(output)) {
        const urls = output.filter((item) => typeof item === 'string');
        this.debugLog('[Replicate] Filtered URLs:', urls);
        return urls.slice(0, n);
      } else if (typeof output === 'string') {
        this.debugLog('[Replicate] Single URL:', output);
        return [output];
      }

      // eslint-disable-next-line no-console
      console.error('[Replicate] Unexpected output format');
      return [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * List available models from Replicate collections
   */
  async models() {
    try {
      // Only fetch text-generation models for chat
      // Image generation is handled separately through textToImage()
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
      // eslint-disable-next-line no-console
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
