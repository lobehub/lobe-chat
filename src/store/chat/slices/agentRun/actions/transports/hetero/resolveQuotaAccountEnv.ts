import { t } from 'i18next';

import { agentQuotaService } from '@/services/agentQuota';
import { heterogeneousAgentService } from '@/services/electron/heterogeneousAgent';

export interface QuotaAccountSpawnPlan {
  /** Account chosen for this run, when routing applied. */
  accountId?: string;
  /** Env overrides realizing the choice (spread before the agent's own env). */
  env: Record<string, string>;
  /** Real provider account id, for run→account usage attribution. */
  externalAccountId?: string;
  reason?: 'pinned' | 'balanced';
}

const NO_ROUTING: QuotaAccountSpawnPlan = { env: {} };

type AccountSelection = NonNullable<
  Awaited<ReturnType<typeof agentQuotaService.selectAccountForAgent>>
>;

/**
 * Where this desktop holds the chosen account's login. `null` = nothing to
 * map (a managed account, no external id, or the desktop could not answer):
 * the spawn keeps the default login, as before routing existed.
 */
const resolveLocalLogin = async (selection: AccountSelection) =>
  selection.credentialMode === 'referenced' && selection.externalAccountId
    ? heterogeneousAgentService
        .resolveClaudeCodeAccount(selection.externalAccountId)
        .catch(() => null)
    : null;

/**
 * Agent env keys that already choose which login (or credential) the CLI
 * uses. The executor spreads the agent's env last, so with any of these set
 * account routing could only be overridden — or, worse, block the run over a
 * pin the agent does not even use.
 */
const AGENT_LOGIN_ENV_KEYS = [
  'CLAUDE_CONFIG_DIR',
  'ANTHROPIC_API_KEY',
  'ANTHROPIC_AUTH_TOKEN',
  'ANTHROPIC_BASE_URL',
] as const;

/**
 * Flags that route Claude Code to a third-party provider (Bedrock / Mantle /
 * Vertex), billed there with no subscription login involved. The CLI reads
 * them as booleans, so "0" / "false" leave subscription routing on — the same
 * rule the quota sampler applies.
 */
const AGENT_EXTERNAL_ROUTING_ENV_KEYS = [
  'CLAUDE_CODE_USE_BEDROCK',
  'CLAUDE_CODE_USE_MANTLE',
  'CLAUDE_CODE_USE_VERTEX',
] as const;

const isFlagEnabled = (value: string | undefined) =>
  !!value?.trim() && !['0', 'false'].includes(value.trim().toLowerCase());

/** The agent's own env decides the login, so subscription routing must stay out. */
const agentEnvPicksLogin = (env?: Record<string, string>) =>
  AGENT_LOGIN_ENV_KEYS.some((key) => env?.[key]?.trim()) ||
  AGENT_EXTERNAL_ROUTING_ENV_KEYS.some((key) => isFlagEnabled(env?.[key]));

/**
 * Resolve which provider account this agent should run on and turn the choice
 * into spawn env. Account rows are shared across devices, but a login is not:
 * the desktop maps the chosen account to the login it holds on THIS machine —
 *
 * - the default login → no override;
 * - the account's own profile → `CLAUDE_CONFIG_DIR=<profile>`;
 * - no local login → the run fails with a clear reason, never falls back to an
 *   unselected login: a pinned account names the missing login, and Auto mode
 *   re-selects among the accounts this device can run, failing when the
 *   rotation holds none of them.
 *
 * No bindings, or the quota service / desktop unreachable, → `{}` and the
 * spawn behaves as before. An agent env that picks its own login wins over
 * routing (see `agentEnvPicksLogin`); the result is also spread BEFORE
 * `heterogeneousProvider.env` for the same reason.
 */
export const resolveQuotaAccountSpawnPlan = async (
  agentId: string | undefined,
  adapterType: string,
  agentEnv?: Record<string, string>,
): Promise<QuotaAccountSpawnPlan> => {
  // Codex accounts exist in the DB but have no runnable credential mapping yet.
  if (adapterType !== 'claude-code' || !agentId) return NO_ROUTING;
  if (agentEnvPicksLogin(agentEnv)) return NO_ROUTING;

  const select = (runnableExternalAccountIds?: string[]) =>
    agentQuotaService
      .selectAccountForAgent(agentId, {
        provider: adapterType,
        ...(runnableExternalAccountIds && { runnableExternalAccountIds }),
      })
      .catch(() => null);

  // Unbound agents (the common case) stop here without touching local logins.
  let selection = await select();
  if (!selection) return NO_ROUTING;

  let resolution = await resolveLocalLogin(selection);

  // Auto picked an account this desktop has no login for: pick again among
  // the ones it has. (Listing first on every run would cost unbound agents
  // a Keychain read per profile for nothing.)
  if (resolution?.kind === 'missing' && selection.reason === 'balanced') {
    const local = await heterogeneousAgentService.listClaudeCodeAccounts().catch(() => null);
    // The desktop could not answer: no basis to judge, keep the old behavior.
    if (!local) return NO_ROUTING;

    const runnable = local.flatMap((account) => account.identity.externalAccountId ?? []);
    const rebalanced = await select(runnable);
    // The listing just read every login, so map the new pick from it rather
    // than scanning the logins again.
    const login = rebalanced
      ? local.find((account) => account.identity.externalAccountId === rebalanced.externalAccountId)
      : undefined;
    if (!rebalanced || !login)
      throw new Error(t('heteroAgent.claudeQuota.noRunnableAccount', { ns: 'chat' }));

    selection = rebalanced;
    resolution = login.configDir
      ? { configDir: login.configDir, kind: 'profile' }
      : { kind: 'default' };
  }

  const attribution = {
    accountId: selection.accountId,
    externalAccountId: selection.externalAccountId ?? undefined,
    reason: selection.reason,
  };

  if (resolution?.kind === 'profile')
    return { ...attribution, env: { CLAUDE_CONFIG_DIR: resolution.configDir } };

  if (resolution?.kind === 'missing' && selection.reason === 'pinned') {
    const pinnedId = selection.accountId;
    const account = await agentQuotaService
      .listAccounts()
      .then((accounts) => accounts.find((a) => a.id === pinnedId))
      .catch(() => undefined);
    throw new Error(
      t('heteroAgent.claudeQuota.accountNotSignedIn', {
        account: account?.label || account?.email || selection.externalAccountId,
        ns: 'chat',
      }),
    );
  }

  return { ...attribution, env: {} };
};
