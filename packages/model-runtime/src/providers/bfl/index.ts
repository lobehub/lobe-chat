import createDebug from 'debug';
import { ClientOptions } from 'openai';

import { LobeRuntimeAI } from '../../core/BaseAI';
import { AgentRuntimeErrorType } from '../../types/error';
import { CreateImagePayload, CreateImageResponse } from '../../types/image';
import { AgentRuntimeError } from '../../utils/createError';
import { createBflImage } from './createImage';

const log = createDebug('lobe-image:bfl');

interface BflAIParams extends ClientOptions {
  fetch?: typeof fetch;
}

export class LobeBflAI implements LobeRuntimeAI {
  private apiKey: string;
  fetch?: typeof fetch;
  baseURL?: string;

  constructor({ apiKey, baseURL, fetch: customFetch }: BflAIParams = {}) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    this.apiKey = apiKey;
    this.baseURL = baseURL || undefined;
    this.fetch = customFetch;

    log('BFL AI initialized');
  }

  async createImage(payload: CreateImagePayload): Promise<CreateImageResponse> {
    const { model, params } = payload;
    log('Creating image with model: %s and params: %O', model, params);

    try {
      return await createBflImage(payload, {
        apiKey: this.apiKey,
        baseURL: this.baseURL,
        fetch: this.fetch,
        provider: 'bfl',
      });
    } catch (error) {
      log('Error in createImage: %O', error);

      // Check for authentication errors based on HTTP status or error properties
      if (error instanceof Error && 'status' in error && (error as any).status === 401) {
        throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey, {
          error,
        });
      }

      // Wrap other errors
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.ProviderBizError, { error });
    }
  }
}
