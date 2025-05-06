import { DEFAULT_AGENT_META } from '@/const/meta';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { LobeAgentConfig } from '@/types/agent';
import { MetaData } from '@/types/meta';

export type LoadingState = Record<Partial<keyof MetaData> | string, boolean>;

export interface State {
  config: LobeAgentConfig;
  id?: string;
  loading?: boolean;
  loadingState?: LoadingState;
  meta: MetaData;
  onConfigChange?: (config: LobeAgentConfig) => void;
  onMetaChange?: (meta: MetaData) => void;
}

export const initialState: State = {
  config: DEFAULT_AGENT_CONFIG,
  loading: true,
  loadingState: {
    avatar: false,
    backgroundColor: false,
    description: false,
    tags: false,
    title: false,
  },
  meta: DEFAULT_AGENT_META,
};
