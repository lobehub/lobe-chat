import type { AcceptanceBundle } from '@/services/verify';

/** A round link displays that round's evidence, never the latest replacement. */
export const checksForTurn = (
  data: AcceptanceBundle,
  turn: number | null,
): AcceptanceBundle['checks'] => {
  if (turn === null) return data.checks;
  return data.checks.flatMap((check) => {
    const step = check.timeline.find((entry) => entry.roundIndex === turn);
    if (!step) return [];
    if (check.resultRound === turn) return [check];
    const review = check.reviews.findLast((item) => item.roundIndex === turn);
    return [
      {
        ...check,
        evidence: step.evidence,
        planItem: data.rounds
          .find((round) => round.run.roundIndex === turn)
          ?.run.plan?.find((item) => item.id === check.id),
        prediction: null,
        result: undefined,
        resultRound: turn,
        state: step.state,
        title: step.title,
        reviews: check.reviews.filter((review) => review.roundIndex <= turn),
        userReview: review ? { ...review, stale: false } : undefined,
      },
    ];
  });
};
