/**
 * Boolean-ish flags that route Claude Code to a third-party provider (AWS
 * Bedrock / Mantle / Google Vertex), billed there with no Anthropic
 * subscription login involved.
 */
export const CLAUDE_CODE_EXTERNAL_ROUTING_ENV_KEYS = [
  'CLAUDE_CODE_USE_BEDROCK',
  'CLAUDE_CODE_USE_MANTLE',
  'CLAUDE_CODE_USE_VERTEX',
] as const;

export type ClaudeCodeExternalRoutingEnvKey =
  (typeof CLAUDE_CODE_EXTERNAL_ROUTING_ENV_KEYS)[number];

/** The CLI reads these as booleans, so "0" / "false" must not count as enabled. */
export const isClaudeCodeRoutingFlagEnabled = (value: string | undefined): boolean =>
  !!value?.trim() && !['0', 'false'].includes(value.trim().toLowerCase());

/** The routing flags present in `env` — what a spawn inherits from it. */
export const pickClaudeCodeRoutingEnv = (
  env: Record<string, string | undefined>,
): Partial<Record<ClaudeCodeExternalRoutingEnvKey, string>> => {
  const picked: Partial<Record<ClaudeCodeExternalRoutingEnvKey, string>> = {};
  for (const key of CLAUDE_CODE_EXTERNAL_ROUTING_ENV_KEYS) {
    const value = env[key];
    if (value !== undefined) picked[key] = value;
  }
  return picked;
};

/**
 * Whether a spawn runs on an external provider. Mirrors the spawn-env merge:
 * the agent env is spread last and wins — even to switch an inherited flag
 * off — and the inherited (desktop process) env fills the gaps.
 */
export const claudeCodeRoutesExternally = (
  agentEnv: Record<string, string | undefined> | undefined,
  inheritedEnv: Record<string, string | undefined> = {},
): boolean =>
  CLAUDE_CODE_EXTERNAL_ROUTING_ENV_KEYS.some((key) =>
    isClaudeCodeRoutingFlagEnabled(agentEnv && key in agentEnv ? agentEnv[key] : inheritedEnv[key]),
  );
