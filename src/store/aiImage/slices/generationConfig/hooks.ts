import { useMemo } from 'react';

import { useAiImageStore } from '../../store';
import { StandardAiImageParameters } from '../../utils/StandardAiImageParameters';
import { parameters, parametersProperties } from './selectors';

export function useImageGenerationParam<N extends keyof StandardAiImageParameters>(paramName: N) {
  const params = useAiImageStore(parameters);
  const paramsProperties = useAiImageStore(parametersProperties);

  const { value, min, max, step, description } = useMemo(() => {
    const paramValue = params?.[paramName];
    const paramSchema = paramsProperties?.[paramName];

    // Extract properties safely using optional chaining and type checks
    const minVal = paramSchema && 'minimum' in paramSchema ? paramSchema.minimum : undefined;
    const maxVal = paramSchema && 'maximum' in paramSchema ? paramSchema.maximum : undefined;
    const stepVal = paramSchema && 'step' in paramSchema ? paramSchema.step : undefined;
    const descriptionVal =
      paramSchema && 'description' in paramSchema ? paramSchema.description : undefined;

    return {
      description: descriptionVal,
      max: maxVal,
      min: minVal,
      step: stepVal,
      value: paramValue,
    };
  }, [params, paramsProperties, paramName]);

  return {
    description,
    max,
    min,
    step,
    value,
  };
}
