import type { LinearIssueStateType } from '@lobechat/types';

import { lambdaClient } from '@/libs/trpc/client';

export interface LinearIssueFilterParams {
  connectionId: string;
  linearProjectId?: string | null;
  stateTypes: LinearIssueStateType[];
  teamId: string;
}

class LinearService {
  disconnect = async (connectionId: string) =>
    lambdaClient.linear.disconnect.mutate({ connectionId });

  getConfig = async () => lambdaClient.linear.getConfig.query();

  listConnections = async () => lambdaClient.linear.listConnections.query();

  // ── Issue sync ──

  listTeams = async (connectionId: string) => lambdaClient.linear.listTeams.query({ connectionId });

  listProjects = async (connectionId: string, teamId: string) =>
    lambdaClient.linear.listProjects.query({ connectionId, teamId });

  listIssues = async (params: LinearIssueFilterParams & { cursor?: string }) =>
    lambdaClient.linear.listIssues.query(params);

  importIssues = async (params: {
    connectionId: string;
    issueIds: string[];
    targetProjectId?: string | null;
  }) => lambdaClient.linear.importIssues.mutate(params);

  listSyncRules = async () => lambdaClient.linear.listSyncRules.query();

  createSyncRule = async (
    params: LinearIssueFilterParams & {
      linearProjectName?: string | null;
      targetProjectId?: string | null;
      teamName: string;
    },
  ) => lambdaClient.linear.createSyncRule.mutate(params);

  deleteSyncRule = async (ruleId: string) => lambdaClient.linear.deleteSyncRule.mutate({ ruleId });

  runSyncRule = async (ruleId: string) => lambdaClient.linear.runSyncRule.mutate({ ruleId });
}

export const linearService = new LinearService();
