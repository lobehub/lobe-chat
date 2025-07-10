import { useCallback, useMemo } from 'react';

import { PRESET_ASPECT_RATIOS } from '@/const/image';
import {
  RuntimeImageGenParams,
  RuntimeImageGenParamsKeys,
} from '@/libs/standard-parameters/meta-schema';

import { useImageStore } from '../../store';
import { imageGenerationConfigSelectors } from './selectors';

export function useGenerationConfigParam<
  N extends RuntimeImageGenParamsKeys,
  V extends RuntimeImageGenParams[N],
>(paramName: N) {
  const parameters = useImageStore(imageGenerationConfigSelectors.parameters);
  const parametersDefinition = useImageStore(imageGenerationConfigSelectors.parametersDefinition);

  const paramValue = parameters?.[paramName] as V;
  const setParamsValue = useImageStore((s) => s.setParamOnInput<N>);
  const setValue = useCallback(
    (value: V) => {
      setParamsValue(paramName, value);
    },
    [paramName, setParamsValue],
  );

  const paramConfig = parametersDefinition?.[paramName];
  const paramConstraints = useMemo(() => {
    const min =
      paramConfig && typeof paramConfig === 'object' && 'min' in paramConfig
        ? paramConfig.min
        : undefined;
    const max =
      paramConfig && typeof paramConfig === 'object' && 'max' in paramConfig
        ? paramConfig.max
        : undefined;
    const step =
      paramConfig && typeof paramConfig === 'object' && 'step' in paramConfig
        ? paramConfig.step
        : undefined;
    const description =
      paramConfig && typeof paramConfig === 'object' && 'description' in paramConfig
        ? paramConfig.description
        : undefined;
    const enumValues =
      paramConfig && typeof paramConfig === 'object' && 'enum' in paramConfig
        ? paramConfig.enum
        : undefined;

    return {
      description,
      max,
      min,
      step,
      enumValues,
    };
  }, [paramConfig]);

  return {
    value: paramValue as V,
    setValue,
    ...paramConstraints,
  };
}

export function useSizeControl() {
  const store = useImageStore();
  const paramsProperties = useImageStore(imageGenerationConfigSelectors.parametersDefinition);

  const modelAspectRatio = useImageStore((s) => s.parameters?.aspectRatio);
  const currentAspectRatio = store.activeAspectRatio ?? modelAspectRatio ?? '1:1';

  const isSupportWidth = useImageStore(imageGenerationConfigSelectors.isSupportedParam('width'));
  const isSupportHeight = useImageStore(imageGenerationConfigSelectors.isSupportedParam('height'));
  const isSupportSize = useImageStore(imageGenerationConfigSelectors.isSupportedParam('size'));

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
