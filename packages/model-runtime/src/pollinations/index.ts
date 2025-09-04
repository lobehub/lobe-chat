import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../types/error';
import { CreateImagePayload, CreateImageResponse } from '../types/image';
import { AgentRuntimeError } from '../utils/createError';

export class LobePollinationsAI implements LobeRuntimeAI {
  constructor() {
    // Pollinations is free and doesn't require API key
  }

  async createImage(payload: CreateImagePayload): Promise<CreateImageResponse> {
    const { params } = payload;
    const { prompt, width = 1024, height = 1024 } = params;

    if (!prompt) {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey, {
        error: new Error('Prompt is required'),
      });
    }

    try {
      // Pollinations API endpoint
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true`;

      return {
        imageUrl,
        width: Number(width),
        height: Number(height),
      };
    } catch (error) {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.ProviderBizError, { error });
    }
  }
}