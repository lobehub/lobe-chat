/**
 * Env a launcher must not pass from its own run to one it dispatches.
 *
 * A launcher (`lh connect`, the desktop gateway, a desktop `lh` command) can
 * itself run inside an agent's shell. Its ambient run identity belongs to that
 * ancestor: inherited ids would attach the dispatched run's output to the wrong
 * conversation, and an inherited `LOBEHUB_JWT_FILE` points at the ancestor's
 * token, which the CLI prefers over the fresh `LOBEHUB_JWT` the launcher injects.
 */
/**
 * The user who started a dispatched run — the `sub` of its `LOBEHUB_JWT`.
 *
 * `lh hetero exec` sets it for the agent it spawns. If the agent clears
 * `LOBEHUB_JWT` and retries with this machine's own credentials, the CLI
 * refuses unless those credentials belong to this user, so a shared device
 * never writes a run's output under its owner's account.
 */
export const RUN_USER_ID_ENV = 'LOBEHUB_RUN_USER_ID';

export const INHERITED_RUN_IDENTITY_ENV_KEYS = [
  'LOBEHUB_AGENT_ID',
  'LOBEHUB_ASSISTANT_MESSAGE_ID',
  'LOBEHUB_JWT_FILE',
  RUN_USER_ID_ENV,
  'LOBEHUB_TASK_ID',
  'LOBEHUB_WORKSPACE_ID',
] as const;

/** A copy of `env` without the ancestor run's identity; the launcher sets its own. */
export const stripInheritedRunIdentity = <T extends Record<string, string | undefined>>(
  env: T,
): T => {
  const next = { ...env };
  for (const key of INHERITED_RUN_IDENTITY_ENV_KEYS) delete next[key];
  return next;
};
