import { fal } from '@fal-ai/client';
import debug from 'debug';
import { pick } from 'lodash-es';
import { ClientOptions } from 'openai';

import { RuntimeImageGenParamsValue } from '@/libs/standard-parameters/meta-schema';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { CreateImagePayload, CreateImageResponse } from '../types/image';
import { AgentRuntimeError } from '../utils/createError';

// Create debug logger
const log = debug('lobe-image:fal');

type FluxDevOutput = Awaited<ReturnType<typeof fal.subscribe<'fal-ai/flux/dev'>>>['data'];

export class LobeFalAI implements LobeRuntimeAI {
  constructor({ apiKey }: ClientOptions = {}) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    fal.config({
      credentials: apiKey,
    });
    log('FalAI initialized with apiKey: %s', apiKey ? '*****' : 'Not set');
  }

  async createImage(payload: CreateImagePayload): Promise<CreateImageResponse> {
    const { model, params } = payload;
    log('Creating image with model: %s and params: %O', model, params);

    const paramsMap = new Map<RuntimeImageGenParamsValue, string>([
      ['steps', 'num_inference_steps'],
      ['cfg', 'guidance_scale'],
      ['imageUrl', 'image_url'],
    ]);

    const defaultInput = {
      enable_safety_checker: false,
      num_images: 1,
    };
    const userInput = Object.fromEntries(
      (Object.entries(params) as [keyof typeof params, any][]).map(([key, value]) => [
        paramsMap.get(key) ?? key,
        value,
      ]),
    );

    if ('width' in userInput && 'height' in userInput) {
      userInput.image_size = {
        height: userInput.height,
        width: userInput.width,
      };
      delete userInput.width;
      delete userInput.height;
    }

    const endpoint = `fal-ai/${model}`;
    log('Calling fal.subscribe with endpoint: %s and input: %O', endpoint, {
      ...defaultInput,
      ...userInput,
    });

    try {
      const { data } = await fal.subscribe(endpoint, {
        input: {
          ...defaultInput,
          ...userInput,
        },
      });
      const image = (data as FluxDevOutput).images[0];
      log('Received image data: %O', image);

      return {
        imageUrl: image.url,
        ...pick(image, ['width', 'height']),
      };
    } catch (error) {
      if (error instanceof Error && 'status' in error && (error as any).status === 401) {
        throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey, {
          error,
        });
      }

      throw AgentRuntimeError.createError(AgentRuntimeErrorType.ProviderBizError, { error });
    }
  }
}
