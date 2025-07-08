import { useCallback, useMemo } from 'react';

import { StdImageGenParams, StdImageGenParamsKeys } from '@/libs/standard-parameters/image';

import { useImageStore } from '../../store';
import { imageGenerationConfigSelectors } from './selectors';

export function useGenerationConfigParam<N extends StdImageGenParamsKeys>(paramName: N) {
  type ValueType = StdImageGenParams[N];

  const parameters = useImageStore(imageGenerationConfigSelectors.parameters);
  const paramsProperties = useImageStore(imageGenerationConfigSelectors.paramsProperties);

  const paramValue = parameters?.[paramName] as ValueType;
  const setParamsValue = useImageStore((s) => s.setParamOnInput<N>);
  const setValue = useCallback(
    (value: ValueType) => {
      setParamsValue(paramName, value);
    },
    [paramName, setParamsValue],
  );

  const paramSchema = paramsProperties?.[paramName];
  const paramConstraints = useMemo(() => {
    const min = paramSchema && 'minimum' in paramSchema ? paramSchema.minimum : undefined;
    const max = paramSchema && 'maximum' in paramSchema ? paramSchema.maximum : undefined;
    const step = paramSchema && 'step' in paramSchema ? paramSchema.step : undefined;
    const description =
      paramSchema && 'description' in paramSchema ? paramSchema.description : undefined;
    const enumValues = paramSchema && 'enum' in paramSchema ? paramSchema.enum : undefined;

    return {
      description,
      max,
      min,
      step,
      enumValues,
    };
  }, [paramSchema]);

  return {
    value: paramValue,
    setValue,
    ...paramConstraints,
  };
}
