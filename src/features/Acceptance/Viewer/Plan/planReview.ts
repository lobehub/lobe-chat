import type { AcceptanceBundle } from '@/services/verify';

type Round = AcceptanceBundle['rounds'][number];

/** Confirmation belongs to the proposed round, never to execution results. */
export const flowPlanPhase = (
  round: { run: Pick<Round['run'], 'flowSnapshots' | 'status' | 'planConfirmedAt'> } | undefined,
) => {
  if (!round?.run.flowSnapshots?.length || round.run.status !== 'planned') return undefined;
  return round.run.planConfirmedAt ? 'confirmed' : 'awaiting';
};
