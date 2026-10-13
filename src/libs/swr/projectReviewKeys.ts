export const projectReviewKeys = {
  invite: (token: string) => ['projectReview:invite', token] as const,
  members: (projectId: string) => ['projectReview:members', projectId] as const,
  sites: (projectId: string) => ['projectReview:sites', projectId] as const,
};
