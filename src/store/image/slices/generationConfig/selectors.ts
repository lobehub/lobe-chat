import { RuntimeImageGenParamsKeys } from '@/libs/standard-parameters/meta-schema';

import { GenerationConfigState } from './initialState';

export const model = (s: GenerationConfigState) => s.model;
export const provider = (s: GenerationConfigState) => s.provider;
export const imageNum = (s: GenerationConfigState) => s.imageNum;

const parameters = (s: GenerationConfigState) => s.parameters;
const parametersDefinition = (s: GenerationConfigState) => s.parametersDefinition;
const isSupportedParam = (paramName: RuntimeImageGenParamsKeys) => {
  return (s: GenerationConfigState) => {
    const _parametersDefinition = parametersDefinition(s);
    return Boolean(paramName in _parametersDefinition);
  };
};

export const imageGenerationConfigSelectors = {
  model,
  provider,
  imageNum,
  isSupportedParam,
  parameters,
  parametersDefinition,
};
