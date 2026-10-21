import type { AiModelForSelect, EnabledAiModel, ModelAbilities } from '../types/aiModel';
import type { AutoRoutingTier } from './const';
import {
  AUTO_ROUTING_MODEL_IDS,
  AUTO_ROUTING_PROVIDER_ID,
  AUTO_ROUTING_TIER_NAMES,
  AUTO_ROUTING_TIERS,
  isAutoRoutingProvider,
} from './const';
import type { AutoRoutingCandidate } from './types';

/** Abilities a tier can offer: any routed-to model may serve the turn. */
const ROUTABLE_ABILITIES = ['audio', 'files', 'functionCall', 'video', 'vision'] as const;

/**
 * Union of the input abilities of every candidate, so the chat input keeps
 * upload and tool controls that at least one routed-to model can honour. The
 * server's hard-constraint filter then picks a model that supports the turn.
 * Reasoning is left out: the tier itself decides how much thinking a turn gets.
 */
export const unionRoutableAbilities = (candidates: AutoRoutingCandidate[]): ModelAbilities => {
  const abilities: ModelAbilities = {};
  for (const ability of ROUTABLE_ABILITIES) {
    if (candidates.some((candidate) => candidate.abilities?.[ability])) abilities[ability] = true;
  }
  return abilities;
};

const maxContextWindow = (candidates: AutoRoutingCandidate[]) => {
  const windows = candidates.flatMap((candidate) =>
    candidate.contextWindowTokens ? [candidate.contextWindowTokens] : [],
  );
  return windows.length > 0 ? Math.max(...windows) : undefined;
};

/** Picker cards for Lite / Pro / Ultra, derived from the visible chat models. */
export const buildAutoRoutingSelectModels = (
  candidates: AutoRoutingCandidate[],
): AiModelForSelect[] => {
  const abilities = unionRoutableAbilities(candidates);
  const contextWindowTokens = maxContextWindow(candidates);
  return AUTO_ROUTING_TIERS.map((tier: AutoRoutingTier) => ({
    abilities,
    contextWindowTokens,
    displayName: AUTO_ROUTING_TIER_NAMES[tier],
    id: AUTO_ROUTING_MODEL_IDS[tier],
  }));
};

/** Enabled-model entries for the virtual models, so ability selectors resolve them. */
export const buildAutoRoutingEnabledModels = (
  candidates: AutoRoutingCandidate[],
): EnabledAiModel[] =>
  buildAutoRoutingSelectModels(candidates).map((model) => ({
    ...model,
    enabled: true,
    providerId: AUTO_ROUTING_PROVIDER_ID,
    type: 'chat',
  }));

const virtualModelCache = new WeakMap<readonly EnabledAiModel[], EnabledAiModel[]>();

/**
 * The enabled-model entry of a tier, derived from the user's enabled chat
 * models, so ability and display selectors resolve `lobehub-auto/auto-*` like
 * a real model. Cached per list identity: selectors must return a stable
 * reference for an unchanged store.
 */
export const findAutoRoutingEnabledModel = (
  id: string,
  enabledAiModels: readonly EnabledAiModel[],
): EnabledAiModel | undefined => {
  let models = virtualModelCache.get(enabledAiModels);
  if (!models) {
    const candidates = enabledAiModels.filter(
      (model) =>
        model.type === 'chat' &&
        model.enabled !== false &&
        !isAutoRoutingProvider(model.providerId),
    );
    models = candidates.length > 0 ? buildAutoRoutingEnabledModels(candidates) : [];
    virtualModelCache.set(enabledAiModels, models);
  }
  return models.find((model) => model.id === id);
};
