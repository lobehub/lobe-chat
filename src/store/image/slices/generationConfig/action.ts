import { StateCreator } from 'zustand/vanilla';

import { StdImageGenParams, StdImageGenParamsKeys } from '@/libs/standard-parameters/image';
import { aiProviderSelectors, getAiInfraStoreState } from '@/store/aiInfra';
import { AIImageModelCard } from '@/types/aiModel';

import type { ImageStore } from '../../store';
import { parseParamsSchema } from '../../utils/parseParamsSchema';
import { adaptSizeToRatio, parseRatio } from '../../utils/size';

export interface GenerationConfigAction {
  setParamOnInput<K extends StdImageGenParamsKeys>(paramName: K, value: StdImageGenParams[K]): void;

  setModelAndProviderOnSelect(model: string, provider: string): void;

  setImageNum: (imageNum: number) => void;

  reuseSettings: (model: string, provider: string, settings: Partial<StdImageGenParams>) => void;
  reuseSeed: (seed: number) => void;

  // 新增方法
  setWidth(width: number): void;
  setHeight(height: number): void;
  toggleAspectRatioLock(): void;
  setAspectRatio(aspectRatio: string): void;
}

/**
 * @internal
 * This function is exported only for testing purposes.
 * Do not use this function directly in application code.
 */
export function getModelAndDefaults(model: string, provider: string) {
  const enabledImageModelList = aiProviderSelectors.enabledImageModelList(getAiInfraStoreState());
  const activeModel = enabledImageModelList
    .find((providerItem) => providerItem.id === provider)
    ?.children.find((modelItem) => modelItem.id === model) as unknown as AIImageModelCard;

  const { defaultValues } = parseParamsSchema(activeModel.parameters!);

  return { defaultValues, activeModel };
}

export const createGenerationConfigSlice: StateCreator<
  ImageStore,
  [['zustand/devtools', never]],
  [],
  GenerationConfigAction
> = (set, get) => ({
  setParamOnInput: (paramName, value) => {
    set(
      (state) => {
        const { parameters } = state;
        if (!parameters) throw new Error('parameters is not initialized');

        return { parameters: { ...parameters, [paramName]: value } };
      },
      false,
      `setParamOnInput/${paramName}`,
    );
  },

  setWidth: (width) => {
    set(
      (state) => {
        const { parameters, isAspectRatioLocked, activeAspectRatio, parameterSchema } = state;
        if (!parameters || !parameterSchema) throw new Error('parameters is not initialized');

        const newParams = { ...parameters, width };

        if (isAspectRatioLocked && activeAspectRatio) {
          const ratio = parseRatio(activeAspectRatio);
          const { properties } = parseParamsSchema(parameterSchema);
          const heightSchema = properties?.height;
          if (
            heightSchema &&
            typeof heightSchema.maximum === 'number' &&
            typeof heightSchema.minimum === 'number'
          ) {
            const newHeight = Math.round(width / ratio);
            newParams.height = Math.max(
              Math.min(newHeight, heightSchema.maximum),
              heightSchema.minimum,
            );
          }
        }

        return { parameters: newParams };
      },
      false,
      `setWidth`,
    );
  },

  setHeight: (height) => {
    set(
      (state) => {
        const { parameters, isAspectRatioLocked, activeAspectRatio, parameterSchema } = state;
        if (!parameters || !parameterSchema) throw new Error('parameters is not initialized');
        const newParams = { ...parameters, height };

        if (isAspectRatioLocked && activeAspectRatio) {
          const ratio = parseRatio(activeAspectRatio);
          const { properties } = parseParamsSchema(parameterSchema);
          const widthSchema = properties?.width;
          if (
            widthSchema &&
            typeof widthSchema.maximum === 'number' &&
            typeof widthSchema.minimum === 'number'
          ) {
            const newWidth = Math.round(height * ratio);
            newParams.width = Math.max(
              Math.min(newWidth, widthSchema.maximum),
              widthSchema.minimum,
            );
          }
        }

        return { parameters: newParams };
      },
      false,
      `setHeight`,
    );
  },

  toggleAspectRatioLock: () => {
    set(
      (state) => {
        const { isAspectRatioLocked, activeAspectRatio, parameters, parameterSchema } = state;
        const newLockState = !isAspectRatioLocked;

        // 如果是从解锁变为锁定，且有活动的宽高比，则立即调整尺寸
        if (newLockState && activeAspectRatio && parameters && parameterSchema) {
          const { properties } = parseParamsSchema(parameterSchema);
          const currentWidth = parameters.width;
          const currentHeight = parameters.height;

          // 只有当width和height都存在时才进行调整
          if (
            typeof currentWidth === 'number' &&
            typeof currentHeight === 'number' &&
            properties?.width &&
            properties?.height
          ) {
            const targetRatio = parseRatio(activeAspectRatio);
            const currentRatio = currentWidth / currentHeight;

            // 如果当前比例与目标比例不匹配，则需要调整
            if (Math.abs(currentRatio - targetRatio) > 0.01) {
              // 允许小误差
              const widthSchema = properties.width;
              const heightSchema = properties.height;

              if (
                widthSchema &&
                heightSchema &&
                typeof widthSchema.maximum === 'number' &&
                typeof widthSchema.minimum === 'number' &&
                typeof heightSchema.maximum === 'number' &&
                typeof heightSchema.minimum === 'number'
              ) {
                // 优先保持宽度，调整高度
                let newWidth = currentWidth;
                let newHeight = Math.round(currentWidth / targetRatio);

                // 如果计算出的高度超出范围，则改为保持高度，调整宽度
                if (newHeight > heightSchema.maximum || newHeight < heightSchema.minimum) {
                  newHeight = currentHeight;
                  newWidth = Math.round(currentHeight * targetRatio);

                  // 确保宽度也在范围内
                  newWidth = Math.max(Math.min(newWidth, widthSchema.maximum), widthSchema.minimum);
                } else {
                  // 确保高度在范围内
                  newHeight = Math.max(
                    Math.min(newHeight, heightSchema.maximum),
                    heightSchema.minimum,
                  );
                }

                return {
                  isAspectRatioLocked: newLockState,
                  parameters: { ...parameters, width: newWidth, height: newHeight },
                };
              }
            }
          }
        }

        return { isAspectRatioLocked: newLockState };
      },
      false,
      'toggleAspectRatioLock',
    );
  },

  setAspectRatio: (aspectRatio) => {
    const { parameters, parameterSchema } = get();
    if (!parameters || !parameterSchema) return;

    const { properties, defaultValues } = parseParamsSchema(parameterSchema);
    const newParams = { ...parameters };

    // 如果模型支持 width/height，则计算新尺寸
    if (
      properties?.width &&
      properties?.height &&
      typeof defaultValues.width === 'number' &&
      typeof defaultValues.height === 'number'
    ) {
      const ratio = parseRatio(aspectRatio);
      const { width, height } = adaptSizeToRatio(ratio, defaultValues.width, defaultValues.height);
      newParams.width = width;
      newParams.height = height;
    }

    // 如果模型本身支持 aspectRatio，则更新它
    if (properties?.aspectRatio) {
      newParams.aspectRatio = aspectRatio;
    }

    set(
      { activeAspectRatio: aspectRatio, parameters: newParams },
      false,
      `setAspectRatio/${aspectRatio}`,
    );
  },

  setModelAndProviderOnSelect: (model, provider) => {
    const { defaultValues, activeModel } = getModelAndDefaults(model, provider);
    const schema = activeModel.parameters || {};
    const props = schema.properties || {};

    let initialActiveRatio: string | null = null;

    // 如果模型没有原生比例或尺寸参数，但有宽高，则启用虚拟比例控制
    if (!props.aspectRatio && !props.size && props.width && props.height) {
      const { width, height } = defaultValues;
      if (typeof width === 'number' && typeof height === 'number' && width > 0 && height > 0) {
        initialActiveRatio = `${width}:${height}`;
      } else {
        initialActiveRatio = '1:1';
      }
    }

    set(
      {
        model,
        provider,
        parameters: defaultValues,
        parameterSchema: schema,
        isAspectRatioLocked: false,
        activeAspectRatio: initialActiveRatio,
      },
      false,
      `setModelAndProviderOnSelect/${model}/${provider}`,
    );
  },

  setImageNum: (imageNum) => {
    set(() => ({ imageNum }), false, `setImageNum/${imageNum}`);
  },

  reuseSettings: (model: string, provider: string, settings: Partial<StdImageGenParams>) => {
    const { defaultValues, activeModel } = getModelAndDefaults(model, provider);
    set(
      () => ({
        model,
        provider,
        parameters: { ...defaultValues, ...settings },
        parameterSchema: activeModel.parameters,
      }),
      false,
      `reuseSettings/${model}/${provider}`,
    );
  },

  reuseSeed: (seed: number) => {
    set((state) => ({ parameters: { ...state.parameters, seed } }), false, `reuseSeed/${seed}`);
  },
});
