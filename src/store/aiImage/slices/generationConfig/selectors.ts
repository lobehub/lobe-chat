import { parseParamsSchema } from '../../utils/parseParamsSchema';
import { GenerationConfigState } from './initialState';

const parameters = (s: GenerationConfigState) => s.parameters;
const paramsSchema = (s: GenerationConfigState) => s.parameterSchema;
const parametersProperties = (s: GenerationConfigState) => {
  const _paramsSchema = paramsSchema(s);
  return _paramsSchema ? parseParamsSchema(_paramsSchema).parametersProperties : undefined;
};

export { parameters, parametersProperties, paramsSchema };
