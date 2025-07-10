import { useCallback, useMemo } from 'react';

import { PRESET_ASPECT_RATIOS } from '@/const/image';
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

export function useSizeControl() {
  const store = useImageStore();
  const paramsProperties = useImageStore(imageGenerationConfigSelectors.paramsProperties);

  const modelAspectRatio = useImageStore((s) => s.parameters?.aspectRatio);
  const currentAspectRatio = store.activeAspectRatio ?? modelAspectRatio ?? '1:1';

  const isSupportWidth = useImageStore(imageGenerationConfigSelectors.isSupportParam('width'));
  const isSupportHeight = useImageStore(imageGenerationConfigSelectors.isSupportParam('height'));
  const isSupportSize = useImageStore(imageGenerationConfigSelectors.isSupportParam('size'));

  const aspectRatioOptions = useMemo(() => {
    const modelOptions = paramsProperties?.aspectRatio?.enum || [];

    // 合并选项，优先使用预设选项，然后添加模型特有的选项
    const allOptions = [...PRESET_ASPECT_RATIOS];

    // 添加模型选项中不在预设中的选项
    modelOptions.forEach((option) => {
      if (!allOptions.includes(option)) {
        allOptions.push(option);
      }
    });

    return allOptions;
  }, [paramsProperties]);

  return {
    isLocked: store.isAspectRatioLocked,
    toggleLock: store.toggleAspectRatioLock,

    width: store.parameters?.width,
    height: store.parameters?.height,
    aspectRatio: currentAspectRatio,

    setWidth: store.setWidth,
    setHeight: store.setHeight,
    setAspectRatio: store.setAspectRatio,

    widthSchema: paramsProperties?.width,
    heightSchema: paramsProperties?.height,

    options: aspectRatioOptions,

    showSizeControl: isSupportWidth && isSupportHeight && !isSupportSize,
  };
}
