/* eslint-disable @typescript-eslint/no-unused-vars */
import { DeepPartial } from 'utility-types';

import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { lambdaClient } from '@/libs/trpc/client';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';
import { LobeAgentChatConfig, LobeAgentConfig } from '@/types/agent';
import { MetaData } from '@/types/meta';
import { BatchTaskResult } from '@/types/service';
import {
  ChatSessionList,
  LobeAgentSession,
  LobeSessionType,
  LobeSessions,
  SessionGroupItem,
  SessionGroups,
  UpdateSessionParams,
} from '@/types/session';

import { ISessionService } from './type';

export class ServerService implements ISessionService {
  hasSessions = async () => {
    return (await this.countSessions()) === 0;
  };

  createSession = async (type: LobeSessionType, data: Partial<LobeAgentSession>) => {
    const { config, group, meta, ...session } = data;

    return lambdaClient.session.createSession.mutate({
      config: { ...config, ...meta } as any,
      session: { ...session, groupId: group },
      type,
    });
  };

  batchCreateSessions = async (importSessions: LobeSessions): Promise<BatchTaskResult> => {
    // TODO: remove any
    const data = await lambdaClient.session.batchCreateSessions.mutate(importSessions as any);
    console.log(data);
    return data;
  };

  cloneSession = async (id: string, newTitle: string): Promise<string | undefined> => {
    return lambdaClient.session.cloneSession.mutate({
      id,
      newTitle,
    });
  };

  getGroupedSessions = async (): Promise<ChatSessionList> => {
    return lambdaClient.session.getGroupedSessions.query();
  };

  countSessions = async (params?: {
    endDate?: string;
    range?: [string, string];
    startDate?: string;
  }): Promise<number> => {
    return lambdaClient.session.countSessions.query(params);
  };

  rankSessions = async () => {
    return lambdaClient.session.rankSessions.query();
  };

  updateSession = async (id: string, data: Partial<UpdateSessionParams>): Promise<any> => {
    const { group, pinned, meta, updatedAt } = data;
    return lambdaClient.session.updateSession.mutate({
      id,
      value: { groupId: group === 'default' ? null : group, pinned, ...meta, updatedAt },
    });
  };

  getSessionConfig = async (id: string): Promise<LobeAgentConfig> => {
    const isLogin = authSelectors.isLogin(useUserStore.getState());
    if (!isLogin) return DEFAULT_AGENT_CONFIG;

    // TODO: Need to be fixed
    // @ts-ignore
    return lambdaClient.agent.getAgentConfig.query({ sessionId: id });
  };

  updateSessionConfig = async (
    id: string,
    config: DeepPartial<LobeAgentConfig>,
    signal?: AbortSignal,
  ): Promise<any> => {
    return lambdaClient.session.updateSessionConfig.mutate({ id, value: config }, { signal });
  };

  updateSessionMeta = async (
    id: string,
    meta: Partial<MetaData>,
    signal?: AbortSignal,
  ): Promise<any> => {
    return lambdaClient.session.updateSessionConfig.mutate(
      {
        id,
        value: meta,
      },
      { signal },
    );
  };

  updateSessionChatConfig = async (
    id: string,
    value: DeepPartial<LobeAgentChatConfig>,
    signal?: AbortSignal,
  ): Promise<any> => {
    return lambdaClient.session.updateSessionChatConfig.mutate({ id, value }, { signal });
  };

  getSessionsByType = async (_type: 'agent' | 'group' | 'all' = 'all'): Promise<LobeSessions> => {
    // TODO: need be fixed
    // @ts-ignore
    return lambdaClient.session.getSessions.query({});
  };

  searchSessions = async (keywords: string): Promise<LobeSessions> => {
    return lambdaClient.session.searchSessions.query({ keywords });
  };

  removeSession = async (id: string): Promise<any> => {
    return lambdaClient.session.removeSession.mutate({ id });
  };

  removeAllSessions = async (): Promise<any> => {
    return lambdaClient.session.removeAllSessions.mutate();
  };

  // ************************************** //
  // ***********  SessionGroup  *********** //
  // ************************************** //

  createSessionGroup = async (name: string, sort?: number): Promise<string> => {
    return lambdaClient.sessionGroup.createSessionGroup.mutate({
      name,
      sort,
    });
  };

  getSessionGroups = async (): Promise<SessionGroupItem[]> => {
    return lambdaClient.sessionGroup.getSessionGroup.query();
  };

  batchCreateSessionGroups = async (_groups: SessionGroups): Promise<BatchTaskResult> => {
    return { added: 0, ids: [], skips: [], success: true };
  };

  removeSessionGroup = async (id: string, removeChildren?: boolean): Promise<any> => {
    return lambdaClient.sessionGroup.removeSessionGroup.mutate({
      id,
      removeChildren,
    });
  };

  removeSessionGroups = async (): Promise<any> => {
    return lambdaClient.sessionGroup.removeAllSessionGroups.mutate();
  };

  updateSessionGroup = async (id: string, value: Partial<SessionGroupItem>): Promise<any> => {
    // TODO: need be fixed
    // @ts-ignore
    return lambdaClient.sessionGroup.updateSessionGroup.mutate({ id, value });
  };

  updateSessionGroupOrder = async (sortMap: { id: string; sort: number }[]): Promise<any> => {
    return lambdaClient.sessionGroup.updateSessionGroupOrder.mutate({ sortMap });
  };
}
