import { produce } from 'immer';

import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { LobeAgentConfig } from '@/types/session';
import { merge } from '@/utils/merge';

export type ConfigDispatch =
  | { config: Partial<any>; type: 'update' }
  | { pluginId: string; type: 'togglePlugin' }
  | { type: 'reset' };

export const configReducer = (state: LobeAgentConfig, payload: ConfigDispatch): LobeAgentConfig => {
  switch (payload.type) {
    case 'update': {
      return produce(state, (draftState) => {
        return merge(draftState, payload.config);
      });
    }

    case 'togglePlugin': {
      return produce(state, (config) => {
        const { pluginId: id } = payload;
        if (config.plugins === undefined) {
          config.plugins = [id];
        } else {
          if (config.plugins.includes(id)) {
            config.plugins.splice(config.plugins.indexOf(id), 1);
          } else {
            config.plugins.push(id);
          }
        }
      });
    }

    case 'reset': {
      return DEFAULT_AGENT_CONFIG;
    }

    default: {
      return state;
    }
  }
};
