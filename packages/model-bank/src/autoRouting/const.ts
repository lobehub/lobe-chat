/**
 * Auto model routing exposes three virtual models under one virtual provider.
 * Every layer that stores `{ provider, model }` (agent config, member override,
 * topic pin) keeps the virtual pair; the server resolves it to a real enabled
 * model at the start of each turn.
 */
export const AUTO_ROUTING_PROVIDER_ID = 'lobehub-auto';

export const AUTO_ROUTING_TIERS = ['lite', 'pro', 'ultra'] as const;

export type AutoRoutingTier = (typeof AUTO_ROUTING_TIERS)[number];

/** Prefixed ids: a bare `lite` matches unrelated model icons (iFlytek Spark). */
export const AUTO_ROUTING_MODEL_IDS: Record<AutoRoutingTier, string> = {
  lite: 'auto-lite',
  pro: 'auto-pro',
  ultra: 'auto-ultra',
};

export const AUTO_ROUTING_TIER_NAMES: Record<AutoRoutingTier, string> = {
  lite: 'Lite',
  pro: 'Pro',
  ultra: 'Ultra',
};

export const isAutoRoutingProvider = (provider?: string | null): boolean =>
  provider === AUTO_ROUTING_PROVIDER_ID;

export const getAutoRoutingTier = (
  model?: string | null,
  provider?: string | null,
): AutoRoutingTier | undefined => {
  if (!isAutoRoutingProvider(provider)) return;
  return AUTO_ROUTING_TIERS.find((tier) => AUTO_ROUTING_MODEL_IDS[tier] === model);
};
