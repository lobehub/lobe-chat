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
  SessionGroupId,
  SessionGroupItem,
  SessionGroups,
} from '@/types/session';

import { ISessionService } from './type';

export class ServerService implements ISessionService {
  async hasSessions() {
    return (await this.countSessions()) === 0;
  }

  createSession(type: LobeSessionType, data: Partial<LobeAgentSession>): Promise<string> {
    const { config, group, meta, ...session } = data;

    return lambdaClient.session.createSession.mutate({
      config: { ...config, ...meta } as any,
      session: { ...session, groupId: group },
      type,
    });
  }

  async batchCreateSessions(importSessions: LobeSessions): Promise<BatchTaskResult> {
    // TODO: remove any
    const data = await lambdaClient.session.batchCreateSessions.mutate(importSessions as any);
    console.log(data);
    return data;
  }

  cloneSession(id: string, newTitle: string): Promise<string | undefined> {
    return lambdaClient.session.cloneSession.mutate({ id, newTitle });
  }

  getGroupedSessions(): Promise<ChatSessionList> {
    return lambdaClient.session.getGroupedSessions.query();
  }

  countSessions(): Promise<number> {
    return lambdaClient.session.countSessions.query();
  }

  updateSession(
    id: string,
    data: Partial<{ group?: SessionGroupId; meta?: any; pinned?: boolean }>,
  ): Promise<any> {
    const { group, pinned, meta } = data;
    return lambdaClient.session.updateSession.mutate({
      id,
      value: { groupId: group === 'default' ? null : group, pinned, ...meta },
    });
  }

  async getSessionConfig(id: string): Promise<LobeAgentConfig> {
    const isLogin = authSelectors.isLogin(useUserStore.getState());
    if (!isLogin) return DEFAULT_AGENT_CONFIG;

    // TODO: Need to be fixed
    // @ts-ignore
    return lambdaClient.session.getSessionConfig.query({ id });
  }

  updateSessionConfig(
    id: string,
    config: DeepPartial<LobeAgentConfig>,
    signal?: AbortSignal,
  ): Promise<any> {
    return lambdaClient.session.updateSessionConfig.mutate({ id, value: config }, { signal });
  }

  updateSessionMeta(id: string, meta: Partial<MetaData>, signal?: AbortSignal): Promise<any> {
    return lambdaClient.session.updateSessionConfig.mutate({ id, value: meta }, { signal });
  }

  updateSessionChatConfig(
    id: string,
    value: DeepPartial<LobeAgentChatConfig>,
    signal?: AbortSignal,
  ): Promise<any> {
    return lambdaClient.session.updateSessionChatConfig.mutate({ id, value }, { signal });
  }

  getSessionsByType(type: 'agent' | 'group' | 'all' = 'all'): Promise<LobeSessions> {
    // TODO: need be fixed
    // @ts-ignore
    return lambdaClient.session.getSessions.query({});
  }

  searchSessions(keywords: string): Promise<LobeSessions> {
    return lambdaClient.session.searchSessions.query({ keywords });
  }

  removeSession(id: string): Promise<any> {
    return lambdaClient.session.removeSession.mutate({ id });
  }

  removeAllSessions(): Promise<any> {
    return lambdaClient.session.removeAllSessions.mutate();
  }

  // ************************************** //
  // ***********  SessionGroup  *********** //
  // ************************************** //

  createSessionGroup(name: string, sort?: number): Promise<string> {
    return lambdaClient.sessionGroup.createSessionGroup.mutate({ name, sort });
  }

  getSessionGroups(): Promise<SessionGroupItem[]> {
    return lambdaClient.sessionGroup.getSessionGroup.query();
  }

  batchCreateSessionGroups(groups: SessionGroups): Promise<BatchTaskResult> {
    return Promise.resolve({ added: 0, ids: [], skips: [], success: true });
  }

  removeSessionGroup(id: string, removeChildren?: boolean): Promise<any> {
    return lambdaClient.sessionGroup.removeSessionGroup.mutate({ id, removeChildren });
  }

  removeSessionGroups(): Promise<any> {
    return lambdaClient.sessionGroup.removeAllSessionGroups.mutate();
  }

  updateSessionGroup(id: string, value: Partial<SessionGroupItem>): Promise<any> {
    // TODO: need be fixed
    // @ts-ignore
    return lambdaClient.sessionGroup.updateSessionGroup.mutate({ id, value });
  }

  updateSessionGroupOrder(sortMap: { id: string; sort: number }[]): Promise<any> {
    return lambdaClient.sessionGroup.updateSessionGroupOrder.mutate({ sortMap });
  }
}
