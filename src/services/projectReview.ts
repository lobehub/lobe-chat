import type { ProjectMemberRole } from '@lobechat/types';

import { lambdaClient } from '@/libs/trpc/client';

export type ProjectSiteList = Awaited<
  ReturnType<typeof lambdaClient.projectReview.listSites.query>
>;
export type ProjectSiteItem = ProjectSiteList[number];
export type ProjectMemberList = Awaited<
  ReturnType<typeof lambdaClient.projectReview.listMembers.query>
>;
export type ProjectMemberItem = ProjectMemberList['members'][number];
export type ProjectInvite = Awaited<ReturnType<typeof lambdaClient.projectReview.getInvite.query>>;

export interface ProjectSiteInput {
  name: string;
  origins: string[];
}

class ProjectReviewService {
  acceptInvite = (token: string) => lambdaClient.projectReview.acceptInvite.mutate({ token });

  createSite = (projectId: string, input: ProjectSiteInput) =>
    lambdaClient.projectReview.createSite.mutate({ projectId, ...input });

  deleteSite = (id: string) => lambdaClient.projectReview.deleteSite.mutate({ id });

  getInvite = (token: string) => lambdaClient.projectReview.getInvite.query({ token });

  inviteMember = (projectId: string, email: string, role: ProjectMemberRole) =>
    lambdaClient.projectReview.inviteMember.mutate({ email, projectId, role });

  listMembers = (projectId: string) => lambdaClient.projectReview.listMembers.query({ projectId });

  listSites = (projectId: string) => lambdaClient.projectReview.listSites.query({ projectId });

  revokeMember = (id: string) => lambdaClient.projectReview.revokeMember.mutate({ id });

  setReviewWorkspaceMembers = (projectId: string, enabled: boolean) =>
    lambdaClient.projectReview.setReviewWorkspaceMembers.mutate({ enabled, projectId });

  updateMemberRole = (id: string, role: ProjectMemberRole) =>
    lambdaClient.projectReview.updateMemberRole.mutate({ id, role });

  updateSite = (id: string, input: Partial<ProjectSiteInput>) =>
    lambdaClient.projectReview.updateSite.mutate({ id, ...input });
}

export const projectReviewService = new ProjectReviewService();
