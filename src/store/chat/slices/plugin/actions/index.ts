import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';

import { PluginInternalsAction, pluginInternals } from './internals';
import { PluginOptimisticUpdateAction, pluginOptimisticUpdate } from './optimisticUpdate';
import { PluginTypesAction, pluginTypes } from './pluginTypes';
import { PluginPublicApiAction, pluginPublicApi } from './publicApi';
import { PluginWorkflowAction, pluginWorkflow } from './workflow';

/**
 * Combined plugin action interface
 * Aggregates all plugin-related actions
 */
export interface ChatPluginAction
  extends PluginPublicApiAction,
    PluginOptimisticUpdateAction,
    PluginTypesAction,
    PluginWorkflowAction,
    PluginInternalsAction {
  /**/
}

/**
 * Combined plugin action creator
 * Merges all plugin action modules
 */
export const chatPlugin: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatPluginAction
> = (...params) => ({
  ...pluginPublicApi(...params),
  ...pluginOptimisticUpdate(...params),
  ...pluginTypes(...params),
  ...pluginWorkflow(...params),
  ...pluginInternals(...params),
});
