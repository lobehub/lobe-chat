import { StateCreator } from 'zustand/vanilla';

import { StdImageGenParams, StdImageGenParamsKeys } from '@/libs/standard-parameters/image';
import { aiProviderSelectors, getAiInfraStoreState } from '@/store/aiInfra';
import { AIImageModelCard } from '@/types/aiModel';

import type { ImageStore } from '../../store';
import { parseParamsSchema } from '../../utils/parseParamsSchema';

export interface GenerationConfigAction {
  setParamOnInput<K extends StdImageGenParamsKeys>(paramName: K, value: StdImageGenParams[K]): void;

  setModelAndProviderOnSelect(model: string, provider: string): void;

  setImageNum: (imageNum: number) => void;

  reuseSettings: (model: string, provider: string, settings: Partial<StdImageGenParams>) => void;
  reuseSeed: (seed: number) => void;
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
> = (set) => ({
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

  setModelAndProviderOnSelect: (model, provider) => {
    const { defaultValues, activeModel } = getModelAndDefaults(model, provider);
    set(
      () => ({
        model,
        provider,
        parameters: defaultValues,
        parameterSchema: activeModel.parameters,
      }),
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
