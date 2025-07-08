import { StdImageGenParamsKeys } from '../../../../libs/standard-parameters/image';
import { parseParamsSchema } from '../../utils/parseParamsSchema';
import { GenerationConfigState } from './initialState';

export const model = (s: GenerationConfigState) => s.model;
export const provider = (s: GenerationConfigState) => s.provider;
export const imageNum = (s: GenerationConfigState) => s.imageNum;

const parameters = (s: GenerationConfigState) => s.parameters;
const paramsSchema = (s: GenerationConfigState) => s.parameterSchema;
const paramsProperties = (s: GenerationConfigState) => {
  const _paramsSchema = paramsSchema(s);
  if (!_paramsSchema) return undefined;

  try {
    return parseParamsSchema(_paramsSchema).properties;
  } catch {
    // Return undefined if schema is invalid
    return undefined;
  }
};
const isSupportParam = (paramName: StdImageGenParamsKeys) => {
  return (s: GenerationConfigState) => {
    const _paramsProperties = paramsProperties(s);
    return Boolean(_paramsProperties && paramName in _paramsProperties);
  };
};

export const imageGenerationConfigSelectors = {
  model,
  provider,
  imageNum,
  isSupportParam,
  parameters,
  paramsProperties,
  paramsSchema,
};
