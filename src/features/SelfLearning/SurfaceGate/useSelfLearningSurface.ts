import { serverConfigSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';
import { labPreferSelectors } from '@/store/user/selectors';

/**
 * Whether the surfaces for reviewing what agents learned (Self-evolving page, My rules) are on.
 *
 * Users in the `agent_self_iteration` rollout get them without the Labs switch, because the
 * background pipeline is already learning for them and they need a place to see and correct it.
 * Everyone else can still opt in through Labs → Self-evolving.
 *
 * `ready` is false until the server config (and so the rollout flag) has loaded; gated pages
 * should not show the "turn on in Labs" state before then.
 */
export const useSelfLearningSurface = () => {
  const ready = useServerConfigStore((s) => s.serverConfigInit);
  const rolledOut = useServerConfigStore(serverConfigSelectors.enableAgentSelfIteration);
  const labEnabled = useUserStore(labPreferSelectors.enableSelfLearning);

  return { enabled: rolledOut || labEnabled, ready };
};
