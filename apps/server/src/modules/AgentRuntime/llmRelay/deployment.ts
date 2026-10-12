import { appEnv } from '@/envs/app';
import { redisEnv } from '@/envs/redis';
import { isRedisDisabledByEnv } from '@/libs/redis';

/**
 * Whether this deployment can relay an LLM call to a browser tab: it pushes to
 * an Agent Gateway (URL + service token) and has the Redis relayed calls run
 * through. Exposed to the browser (`llmRelayAvailable`) so a tab only gives up
 * its own provider fallback where the server can actually relay.
 */
export const isLlmRelayDeploymentReady = (): boolean =>
  !!(appEnv.AGENT_GATEWAY_INTERNAL_URL || appEnv.AGENT_GATEWAY_URL) &&
  !!appEnv.AGENT_GATEWAY_SERVICE_TOKEN &&
  !!redisEnv.REDIS_URL &&
  !isRedisDisabledByEnv();
