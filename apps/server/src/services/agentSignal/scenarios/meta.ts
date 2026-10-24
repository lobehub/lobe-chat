import { isBotWakeEnabled } from './botWake/gate';
import type {
  AgentSignalScenarioGateInput,
  AgentSignalScenarioId,
  AgentSignalScenarioMeta,
} from './types';
import { AGENT_SIGNAL_SCENARIO_IDS } from './types';

export const botWakeScenarioMeta: AgentSignalScenarioMeta = {
  execution: 'sync',
  gate: ({ botWake }) => isBotWakeEnabled(botWake),
  id: AGENT_SIGNAL_SCENARIO_IDS.botWake,
};

export const selfIterationScenarioMeta: AgentSignalScenarioMeta = {
  execution: 'async',
  // Lazy on purpose: the gate reads `UserModel`, and policy construction (tests, evals) must not
  // load the database model graph just to install handlers.
  gate: async ({ db, userId }) => {
    const { isAgentSignalEnabledForUser } = await import('../featureGate');

    return isAgentSignalEnabledForUser(db, userId);
  },
  id: AGENT_SIGNAL_SCENARIO_IDS.selfIteration,
};

export const AGENT_SIGNAL_SCENARIO_METAS: Readonly<
  Record<AgentSignalScenarioId, AgentSignalScenarioMeta>
> = {
  'bot-wake': botWakeScenarioMeta,
  'self-iteration': selfIterationScenarioMeta,
};

export const getAgentSignalScenarioMeta = (id: AgentSignalScenarioId): AgentSignalScenarioMeta =>
  AGENT_SIGNAL_SCENARIO_METAS[id];

/** Whether the scenario's own gate lets the event run. */
export const isAgentSignalScenarioEnabled = async (
  id: AgentSignalScenarioId,
  input: AgentSignalScenarioGateInput,
): Promise<boolean> => Boolean(await getAgentSignalScenarioMeta(id).gate(input));
