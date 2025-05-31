import { StateCreator } from 'zustand/vanilla';

import { AIImageModelCard } from '@/types/aiModel';

import type { ImageStore } from '../../store';
import {
  StandardImageGenerationParameters,
  StandardImageGenerationParametersKeys,
} from '../../utils/StandardParameters';
import { parseParamsSchema } from '../../utils/parseParamsSchema';

export interface GenerationConfigAction {
  setParamOnInput<K extends StandardImageGenerationParametersKeys>(
    paramName: K,
    value: StandardImageGenerationParameters[K],
  ): void;

  setModelAndProviderOnSelect(model: string, provider: string): void;

  updateParamsWhenModelChange(model: AIImageModelCard): void;
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
        const parameters = state.parameters;
        if (!parameters) throw new Error('parameters is not initialized');

        return { parameters: { ...parameters, [paramName]: value } };
      },
      false,
      `setParamOnInput/${paramName}`,
    );
  },

  setModelAndProviderOnSelect: (model, provider) => {
    set(() => ({ model, provider }), false, `setModelAndProviderOnSelect/${model}/${provider}`);
  },

  updateParamsWhenModelChange: (model: AIImageModelCard) => {
    const { defaultValues } = parseParamsSchema(model.parameters!);
    set(
      () => ({ parameters: defaultValues, parameterSchema: model.parameters }),
      false,
      `updateParamsWhenModelChange/${model.id}`,
    );
  },
});
