import { StateCreator } from 'zustand/vanilla';

import { OpenAIImagePayload } from '@/types/openai/image';
import { DallEImageItem } from '@/types/tool/dalle';
import { setNamespace } from '@/utils/storeDebug';

import { ToolStore } from '../../store';

const n = setNamespace('builtinTool');

interface Text2ImageParams extends Pick<OpenAIImagePayload, 'quality' | 'style' | 'size'> {
  prompts: string[];
}

/**
 * 代理行为接口
 */
export interface BuiltinToolAction {
  invokeBuiltinTool: (key: string, params: any) => Promise<string | undefined>;
  text2image: (params: Text2ImageParams, messageId: string) => DallEImageItem[];
  toggleBuiltinToolLoading: (key: string, value: boolean) => void;
}

export const createBuiltinToolSlice: StateCreator<
  ToolStore,
  [['zustand/devtools', never]],
  [],
  BuiltinToolAction
> = (set, get) => ({
  invokeBuiltinTool: async (key, params) => {
    const { builtinToolLoading, toggleBuiltinToolLoading } = get();

    if (builtinToolLoading[key]) return;

    toggleBuiltinToolLoading(key, true);

    const { [key as keyof BuiltinToolAction]: action } = get();

    if (!action) return;

    // @ts-ignore
    const result = await action(params);

    toggleBuiltinToolLoading(key, false);

    return JSON.stringify(result);
  },
  text2image: ({ prompts, size = '1024x1024' as const, quality = 'standard', style = 'vivid' }) =>
    prompts.map((p) => ({ prompt: p, quality, size, style })),

  toggleBuiltinToolLoading: (key, value) => {
    set({ builtinToolLoading: { [key]: value } }, false, n('toggleBuiltinToolLoading'));
  },
});
