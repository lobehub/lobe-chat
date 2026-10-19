import { RUN_USER_ID_ENV } from '@lobechat/heterogeneous-agents/protocol';

import { parseJwtSub } from '../auth/resolveToken';

/**
 * Extra env for the spawned agent process.
 *
 * In server-ingest mode the run's operation and conversation arrive as CLI
 * arguments, not env, so the agent's own shell could not name them. Commands it
 * runs on behalf of this conversation — `lh goal create --conversation` for
 * `/goal`, evidence ingests — read `LOBEHUB_OPERATION_ID` / `LOBEHUB_TOPIC_ID`,
 * so they are echoed into the child. The run's user goes along too, so `lh`
 * can refuse a fallback to this machine's login when that is someone else (see
 * `checkRunIdentity`). A standalone run has no server identity and passes none.
 */
export const buildAgentProcessEnv = ({
  operationId,
  pathEnv,
  runUserId,
  topicId,
}: {
  operationId?: string;
  pathEnv?: string;
  runUserId?: string;
  topicId?: string;
}): Record<string, string> | undefined => {
  const env: Record<string, string> = {
    ...(pathEnv ? { PATH: pathEnv } : {}),
    ...(operationId ? { LOBEHUB_OPERATION_ID: operationId } : {}),
    ...(runUserId ? { [RUN_USER_ID_ENV]: runUserId } : {}),
    ...(topicId ? { LOBEHUB_TOPIC_ID: topicId } : {}),
  };
  return Object.keys(env).length > 0 ? env : undefined;
};

/** The user this run acts for: the subject of its operation token. */
export const resolveRunUserId = (): string | undefined => {
  const jwt = process.env.LOBEHUB_JWT;
  return jwt ? parseJwtSub(jwt) : undefined;
};
