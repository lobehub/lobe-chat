import type { RankedCandidate } from './tiers';
import type { AutoRoutingCandidate, AutoRoutingRequirements } from './types';

export const meetsRequirements = (
  candidate: AutoRoutingCandidate,
  requirements: AutoRoutingRequirements,
): boolean => {
  const abilities = candidate.abilities ?? {};
  if (requirements.vision && !abilities.vision) return false;
  if (requirements.video && !abilities.video) return false;
  if (requirements.audio && !abilities.audio) return false;
  if (requirements.functionCall && !abilities.functionCall) return false;
  if (
    requirements.minContextTokens &&
    candidate.contextWindowTokens &&
    candidate.contextWindowTokens < requirements.minContextTokens
  )
    return false;
  return true;
};

/**
 * Keep the candidates that satisfy every hard constraint. When none does, fall
 * back to the unfiltered order: the runtime still has its own multimodal
 * fallback, which beats refusing the turn.
 */
export const filterByRequirements = (
  ordered: RankedCandidate[],
  requirements: AutoRoutingRequirements,
): RankedCandidate[] => {
  const matched = ordered.filter((item) => meetsRequirements(item.candidate, requirements));
  return matched.length > 0 ? matched : ordered;
};
