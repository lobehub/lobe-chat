/** Run history is an owner workspace; shared viewers only need the latest aggregate state. */
export const canViewAcceptanceHistory = (isOwner: boolean) => isOwner;

/** Remove round navigation itself when its history destination is unavailable. */
export const resolveAcceptanceHistoryNavigation = (
  isOwner: boolean,
  onRound: (round: number) => void,
) => (canViewAcceptanceHistory(isOwner) ? onRound : undefined);

/**
 * Whether the viewer may act on the checks (accept / reject / ignore, group
 * feedback, proposal adjudication).
 *
 * The server decides this — it is the creator OR an owner/admin of the
 * acceptance's workspace, exactly what the write path enforces — so the client must not
 * re-derive it from `isOwner`. Reading it off the bundle rather than taking it
 * from the host is what keeps a shared link from rendering live controls whose
 * every click answers "Acceptance not found"; deriving it from ownership alone
 * is what locked a workspace owner out of a teammate's delivery.
 */
export const canReviewAcceptance = (bundle?: { canReview?: boolean; isOwner?: boolean } | null) =>
  Boolean(bundle?.canReview);

/**
 * Whether the decision bar is shown with its actions disabled.
 *
 * A teammate who may approve but not decide must still see that Reject and
 * Accept exist and why they cannot press them — a bar that silently vanishes
 * reads as "nobody can decide this". Viewers and link visitors, who cannot
 * weigh in at all, keep seeing no decision controls.
 */
export const isReadOnlyAcceptanceDecider = (
  bundle: { canReview?: boolean } | null | undefined,
  canApprove: boolean,
) => Boolean(bundle) && !canReviewAcceptance(bundle) && canApprove;

/**
 * Whether the viewer may send the delivery back but not otherwise decide it:
 * a decider granted them reject access. The server widens `canReject` by the
 * same grant the reject mutation honours, and the repair it starts runs on the
 * owner's agent.
 */
export const canRejectAcceptanceOnly = (
  bundle?: { canReject?: boolean; canReview?: boolean } | null,
) => Boolean(bundle?.canReject) && !bundle?.canReview;

/** Evidence discussion follows comment access, independently of review decisions. */
export const canCommentOnAcceptanceEvidence = (
  bundle: { isOwner: boolean } | null | undefined,
  canComment: boolean,
) => canComment && Boolean(bundle);
