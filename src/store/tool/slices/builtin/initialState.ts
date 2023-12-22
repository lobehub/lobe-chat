import { LobeBuiltinTool } from '@/types/tool';

import { builtinTools } from '../../../../tools';

export interface BuiltinToolState {
  builtinToolLoading: Record<string, boolean>;
  builtinTools: LobeBuiltinTool[];
}

export const initialBuiltinToolState: BuiltinToolState = {
  builtinToolLoading: {},
  builtinTools,
};
