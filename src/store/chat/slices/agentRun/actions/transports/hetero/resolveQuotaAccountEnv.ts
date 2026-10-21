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
 * Resolve which provider account this agent should run on and turn the choice
 * into spawn env. Account rows are shared across devices, but a login is not:
 * the desktop maps the chosen account to the login it holds on THIS machine —
 *
 * - the default login → no override;
 * - the account's own profile → `CLAUDE_CONFIG_DIR=<profile>`;
 * - no local login → a pinned account fails the run with a clear reason
 *   (running the default login instead is exactly the "switch that does
 *   nothing" this replaces); Auto mode only ever picks runnable accounts.
 *
 * No bindings, or the quota service unreachable, → `{}` and the spawn behaves
 * as before. The result is spread BEFORE `heterogeneousProvider.env`: an env
 * the user put on the agent explicitly is a stronger, more specific choice
 * than pool routing, and must keep winning.
 */
export const resolveQuotaAccountSpawnPlan = async (
  agentId: string | undefined,
  adapterType: string,
): Promise<QuotaAccountSpawnPlan> => {
  // Codex accounts exist in the DB but have no runnable credential mapping yet.
  if (adapterType !== 'claude-code' || !agentId) return NO_ROUTING;

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
    const runnable = local?.flatMap((account) => account.identity.externalAccountId ?? []);
    selection = runnable ? await select(runnable) : null;
    if (!selection) return NO_ROUTING;
    resolution = await resolveLocalLogin(selection);
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
