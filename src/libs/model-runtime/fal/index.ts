import { fal } from '@fal-ai/client';
import debug from 'debug';
import { pick } from 'lodash-es';
import { ClientOptions } from 'openai';

import { StdImageGenParamsKeys } from '@/store/image/utils/StandardParameters';

import { LobeRuntimeAI } from '../BaseAI';
import { CreateImagePayload, CreateImageResponse } from '../types/image';

// Create debug logger
const log = debug('lobe-image:fal');

type FluxDevOutput = Awaited<ReturnType<typeof fal.subscribe<'fal-ai/flux/dev'>>>['data'];

const DEFAULT_API_KEY = 'Not set api key for fal, bro!';

export class LobeFalAI implements LobeRuntimeAI {
  constructor({ apiKey }: ClientOptions = {}) {
    fal.config({
      credentials: apiKey ?? DEFAULT_API_KEY,
    });
    log('FalAI initialized with apiKey: %s', apiKey ? '*****' : 'Not set');
  }

  async createImage(payload: CreateImagePayload): Promise<CreateImageResponse> {
    const { model, params } = payload;
    log('Creating image with model: %s and params: %O', model, params);

    const paramsMap = new Map<StdImageGenParamsKeys, string>([
      ['steps', 'num_inference_steps'],
      ['cfg', 'guidance_scale'],
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
    const endpoint = `fal-ai/${model}`;
    log('Calling fal.subscribe with endpoint: %s and input: %O', endpoint, {
      ...defaultInput,
      ...userInput,
    });

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
  }
}
