import {
  ModelParamsSchema,
  RuntimeImageGenParams,
  RuntimeImageGenParamsKeys,
  RuntimeImageGenParamsValue,
  extractDefaultValues,
} from 'model-bank';
import { StateCreator } from 'zustand/vanilla';

import { aiProviderSelectors, getAiInfraStoreState } from '@/store/aiInfra';
import { AIImageModelCard } from '@/types/aiModel';

import type { ImageStore } from '../../store';
import { adaptSizeToRatio, parseRatio } from '../../utils/size';

export interface GenerationConfigAction {
  setParamOnInput<K extends RuntimeImageGenParamsKeys>(
    paramName: K,
    value: RuntimeImageGenParamsValue,
  ): void;

  setModelAndProviderOnSelect(model: string, provider: string): void;

  setImageNum: (imageNum: number) => void;

  reuseSettings: (
    model: string,
    provider: string,
    settings: Partial<RuntimeImageGenParams>,
  ) => void;
  reuseSeed: (seed: number) => void;

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

  const parametersSchema = activeModel.parameters as ModelParamsSchema;
  const defaultValues = extractDefaultValues(parametersSchema);

  return { defaultValues, activeModel, parametersSchema };
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
        return { parameters: { ...parameters, [paramName]: value } };
      },
      false,
      `setParamOnInput/${paramName}`,
    );
  },

  setWidth: (width) => {
    set(
      (state) => {
        const {
          parameters,
          isAspectRatioLocked,
          activeAspectRatio,
          parametersSchema: parametersSchema,
        } = state;

        const newParams = { ...parameters, width };
        if (isAspectRatioLocked && activeAspectRatio) {
          const ratio = parseRatio(activeAspectRatio);
          const heightSchema = parametersSchema?.height;
          if (
            heightSchema &&
            typeof heightSchema.max === 'number' &&
            typeof heightSchema.min === 'number'
          ) {
            const newHeight = Math.round(width / ratio);
            newParams.height = Math.max(Math.min(newHeight, heightSchema.max), heightSchema.min);
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
        const {
          parameters,
          isAspectRatioLocked,
          activeAspectRatio,
          parametersSchema: parametersSchema,
        } = state;
        const newParams = { ...parameters, height };

        if (isAspectRatioLocked && activeAspectRatio) {
          const ratio = parseRatio(activeAspectRatio);
          const widthSchema = parametersSchema?.width;
          if (
            widthSchema &&
            typeof widthSchema.max === 'number' &&
            typeof widthSchema.min === 'number'
          ) {
            const newWidth = Math.round(height * ratio);
            newParams.width = Math.max(Math.min(newWidth, widthSchema.max), widthSchema.min);
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
        const {
          isAspectRatioLocked,
          activeAspectRatio,
          parameters,
          parametersSchema: parametersSchema,
        } = state;
        const newLockState = !isAspectRatioLocked;

        // 如果是从解锁变为锁定，且有活动的宽高比，则立即调整尺寸
        if (newLockState && activeAspectRatio && parameters && parametersSchema) {
          const currentWidth = parameters.width;
          const currentHeight = parameters.height;

          // 只有当width和height都存在时才进行调整
          if (
            typeof currentWidth === 'number' &&
            typeof currentHeight === 'number' &&
            parametersSchema?.width &&
            parametersSchema?.height
          ) {
            const targetRatio = parseRatio(activeAspectRatio);
            const currentRatio = currentWidth / currentHeight;

            // 如果当前比例与目标比例不匹配，则需要调整
            if (Math.abs(currentRatio - targetRatio) > 0.01) {
              // 允许小误差
              const widthSchema = parametersSchema.width;
              const heightSchema = parametersSchema.height;

              if (
                widthSchema &&
                heightSchema &&
                typeof widthSchema.max === 'number' &&
                typeof widthSchema.min === 'number' &&
                typeof heightSchema.max === 'number' &&
                typeof heightSchema.min === 'number'
              ) {
                // 优先保持宽度，调整高度
                let newWidth = currentWidth;
                let newHeight = Math.round(currentWidth / targetRatio);

                // 如果计算出的高度超出范围，则改为保持高度，调整宽度
                if (newHeight > heightSchema.max || newHeight < heightSchema.min) {
                  newHeight = currentHeight;
                  newWidth = Math.round(currentHeight * targetRatio);

                  // 确保宽度也在范围内
                  newWidth = Math.max(Math.min(newWidth, widthSchema.max), widthSchema.min);
                } else {
                  // 确保高度在范围内
                  newHeight = Math.max(Math.min(newHeight, heightSchema.max), heightSchema.min);
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
    const { parameters, parametersSchema: parametersSchema } = get();
    if (!parameters || !parametersSchema) return;

    const defaultValues = extractDefaultValues(parametersSchema);
    const newParams = { ...parameters };

    // 如果模型支持 width/height，则计算新尺寸
    if (
      parametersSchema?.width &&
      parametersSchema?.height &&
      typeof defaultValues.width === 'number' &&
      typeof defaultValues.height === 'number'
    ) {
      const ratio = parseRatio(aspectRatio);
      const { width, height } = adaptSizeToRatio(ratio, defaultValues.width, defaultValues.height);
      newParams.width = width;
      newParams.height = height;
    }

    // 如果模型本身支持 aspectRatio，则更新它
    if (parametersSchema?.aspectRatio) {
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
    const parametersSchema = activeModel.parameters;

    let initialActiveRatio: string | null = null;

    // 如果模型没有原生比例或尺寸参数，但有宽高，则启用虚拟比例控制
    if (
      !parametersSchema?.aspectRatio &&
      !parametersSchema?.size &&
      parametersSchema?.width &&
      parametersSchema?.height
    ) {
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
        parametersSchema: parametersSchema,
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

  reuseSettings: (model: string, provider: string, settings: Partial<RuntimeImageGenParams>) => {
    const { defaultValues, parametersSchema } = getModelAndDefaults(model, provider);
    set(
      () => ({
        model,
        provider,
        parameters: { ...defaultValues, ...settings },
        parametersSchema: parametersSchema,
      }),
      false,
      `reuseSettings/${model}/${provider}`,
    );
  },

  reuseSeed: (seed: number) => {
    set((state) => ({ parameters: { ...state.parameters, seed } }), false, `reuseSeed/${seed}`);
  },
});
