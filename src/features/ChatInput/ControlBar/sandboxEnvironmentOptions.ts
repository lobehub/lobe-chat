/**
 * The environments a conversation may start from. A workspace-public agent runs
 * on its caller's session, so it applies published environments only — the
 * server refuses a private one for it, and offering it here would promise a
 * setup that never runs.
 */
export const pickableEnvironments = <T extends { visibility?: string | null }>(
  environments: readonly T[],
  sharedAgent: boolean,
): T[] =>
  sharedAgent
    ? environments.filter((environment) => environment.visibility === 'public')
    : [...environments];
