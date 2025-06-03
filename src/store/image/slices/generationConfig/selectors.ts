import { StandardImageGenerationParametersKeys } from '../../utils/StandardParameters';
import { parseParamsSchema } from '../../utils/parseParamsSchema';
import { GenerationConfigState } from './initialState';

export const model = (s: GenerationConfigState) => s.model;
export const provider = (s: GenerationConfigState) => s.provider;

const parameters = (s: GenerationConfigState) => s.parameters;
const paramsSchema = (s: GenerationConfigState) => s.parameterSchema;
const paramsProperties = (s: GenerationConfigState) => {
  const _paramsSchema = paramsSchema(s);
  return _paramsSchema ? parseParamsSchema(_paramsSchema).properties : undefined;
};
const isSupportParam = (paramName: StandardImageGenerationParametersKeys) => {
  return (s: GenerationConfigState) => {
    const _paramsProperties = paramsProperties(s);
    return Boolean(_paramsProperties && paramName in _paramsProperties);
  };
};

export const imageGenerationConfigSelectors = {
  model,
  provider,
  isSupportParam,
  parameters,
  paramsProperties,
  paramsSchema,
};
