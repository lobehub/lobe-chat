import { useCallback, useEffect, useMemo } from 'react';

import { useAiInfraStore } from '@/store/aiInfra';
import { aiProviderSelectors } from '@/store/aiInfra/slices/aiProvider/selectors';
import { AIImageModelCard } from '@/types/aiModel';

import { useImageStore } from '../../store';
import {
  StandardImageGenerationParameters,
  StandardImageGenerationParametersKeys,
} from '../../utils/StandardParameters';
import { imageGenerationConfigSelectors } from './selectors';

export function useGenerationConfigParam<N extends StandardImageGenerationParametersKeys>(
  paramName: N,
) {
  type ValueType = StandardImageGenerationParameters[N];

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

export function useUpdateActiveModelEffect() {
  const modelId = useImageStore(imageGenerationConfigSelectors.model);
  const providerId = useImageStore(imageGenerationConfigSelectors.provider);
  const enabledImageModelList = useAiInfraStore(aiProviderSelectors.enabledImageModelList);
  const updateParamsWhenModelChange = useImageStore((s) => s.updateParamsWhenModelChange);

  useEffect(() => {
    const activeModel = enabledImageModelList
      .find((provider) => provider.id === providerId)
      ?.children.find((model) => model.id === modelId) as unknown as AIImageModelCard | undefined;

    if (activeModel) {
      updateParamsWhenModelChange(activeModel);
    }
  }, [modelId, providerId, enabledImageModelList]);
}
