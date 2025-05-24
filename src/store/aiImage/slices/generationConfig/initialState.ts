/* eslint-disable typescript-sort-keys/interface */
import FluxSchnellSchema from '@/config/paramsSchemas/fal/flux-schnell.json';

import { StandardAiImageParameters } from '../../utils/StandardAiImageParameters';
import { parseParamsSchema } from '../../utils/parseParamsSchema';

export interface GenerationConfigState {
  parameters?: Partial<StandardAiImageParameters>;
  parameterSchema?: Record<string, any>;
}

export const DEFAULT_IMAGE_GENERATION_PARAMETERS: Partial<StandardAiImageParameters> =
  parseParamsSchema(FluxSchnellSchema).parametersValues;

export const initialGenerationConfigState: GenerationConfigState = {
  parameterSchema: FluxSchnellSchema,
  parameters: DEFAULT_IMAGE_GENERATION_PARAMETERS,
};
