import { DEFAULT_MODEL, DEFAULT_PROVIDER, DEFAUTT_AGENT_TTS_CONFIG } from '@lobechat/const';
import { LobeAgentTTSConfig } from '@lobechat/types';

import type { AgentStoreState } from '../initialState';
import { agentSelectors } from './selectors';

/**
 * Selectors that get agent config by agentId parameter.
 * Used in ChatInput components where agentId is passed as prop.
 */

const getAgentModelById =
  (agentId: string) =>
  (s: AgentStoreState): string =>
    agentSelectors.getAgentConfigById(agentId)(s)?.model || DEFAULT_MODEL;

const getAgentModelProviderById =
  (agentId: string) =>
  (s: AgentStoreState): string =>
    agentSelectors.getAgentConfigById(agentId)(s)?.provider || DEFAULT_PROVIDER;

const getAgentPluginsById =
  (agentId: string) =>
  (s: AgentStoreState): string[] =>
    agentSelectors.getAgentConfigById(agentId)(s)?.plugins || [];

const getAgentSystemRoleById =
  (agentId: string) =>
  (s: AgentStoreState): string | undefined =>
    agentSelectors.getAgentConfigById(agentId)(s)?.systemRole;

const getAgentTTSById =
  (agentId: string) =>
  (s: AgentStoreState): LobeAgentTTSConfig =>
    agentSelectors.getAgentConfigById(agentId)(s)?.tts || DEFAUTT_AGENT_TTS_CONFIG;

const getAgentFilesById = (agentId: string) => (s: AgentStoreState) =>
  agentSelectors.getAgentConfigById(agentId)(s)?.files || [];

const getAgentKnowledgeBasesById = (agentId: string) => (s: AgentStoreState) =>
  agentSelectors.getAgentConfigById(agentId)(s)?.knowledgeBases || [];

const isAgentConfigLoadingById = (agentId: string) => (s: AgentStoreState) =>
  !agentId || !s.agentConfigInitMap[agentId];

export const agentByIdSelectors = {
  getAgentConfigById: agentSelectors.getAgentConfigById,
  getAgentFilesById,
  getAgentKnowledgeBasesById,
  getAgentModelById,
  getAgentModelProviderById,
  getAgentPluginsById,
  getAgentSystemRoleById,
  getAgentTTSById,
  isAgentConfigLoadingById,
};
