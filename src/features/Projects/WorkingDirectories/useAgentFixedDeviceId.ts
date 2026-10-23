import { useAgentStore } from '@/store/agent';
import { agentByIdSelectors } from '@/store/agent/selectors';

/**
 * The device an agent's author fixed it to, if any. Read from the shared row,
 * as the composer's device switcher does: it is what the server checks a run
 * in a project directory against. Undefined while the agent is not loaded.
 */
export const useAgentFixedDeviceId = (agentId: string | undefined) =>
  useAgentStore((s) => {
    if (!agentId) return undefined;
    const agencyConfig = agentByIdSelectors.getAgencyConfigById(agentId)(s);
    return agencyConfig?.executionTargetSelectionPolicy === 'fixed'
      ? (agencyConfig.boundDeviceId ?? undefined)
      : undefined;
  });
