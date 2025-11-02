import { StateCreator } from 'zustand/vanilla';

import { setNamespace } from '@/utils/storeDebug';

import { ToolStore } from '../../store';

const n = setNamespace('builtinTool');

/**
 * 代理行为接口
 */
export interface BuiltinToolAction {
  toggleBuiltinToolLoading: (key: string, value: boolean) => void;
  transformApiArgumentsToAiState: (key: string, params: any) => Promise<string | undefined>;
}

export const createBuiltinToolSlice: StateCreator<
  ToolStore,
  [['zustand/devtools', never]],
  [],
  BuiltinToolAction
> = (set, get) => ({
  toggleBuiltinToolLoading: (key, value) => {
    set({ builtinToolLoading: { [key]: value } }, false, n('toggleBuiltinToolLoading'));
  },

  transformApiArgumentsToAiState: async (key, params) => {
    const { builtinToolLoading, toggleBuiltinToolLoading } = get();
    if (builtinToolLoading[key]) return;

    const { [key as keyof BuiltinToolAction]: action } = get();

    if (!action) return JSON.stringify(params);

    toggleBuiltinToolLoading(key, true);

    try {
      // @ts-ignore
      const result = await action(params);

      toggleBuiltinToolLoading(key, false);

      return JSON.stringify(result);
    } catch (e) {
      toggleBuiltinToolLoading(key, false);
      throw e;
    }
  },
});
