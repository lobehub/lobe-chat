/* eslint-disable @typescript-eslint/no-unused-vars */
import { lambdaClient } from '@/libs/trpc/client';

import { ISessionService } from './type';

export class ServerService implements ISessionService {
  hasSessions: ISessionService['hasSessions'] = async () => {
    const result = await this.countSessions();
    return result === 0;
  };

  createSession: ISessionService['createSession'] = async (type, data) => {
    const { config, group, meta, ...session } = data;
    return lambdaClient.session.createSession.mutate({
      config: { ...config, ...meta } as any,
      session: { ...session, groupId: group },
      type,
    });
  };

  batchCreateSessions: ISessionService['batchCreateSessions'] = async (importSessions) => {
    // TODO: remove any
    const data = await lambdaClient.session.batchCreateSessions.mutate(importSessions as any);
    console.log(data);
    return data;
  };

  cloneSession: ISessionService['cloneSession'] = (id, newTitle) => {
    return lambdaClient.session.cloneSession.mutate({ id, newTitle });
  };

  getGroupedSessions: ISessionService['getGroupedSessions'] = () => {
    return lambdaClient.session.getGroupedSessions.query();
  };

  countSessions: ISessionService['countSessions'] = async (params) => {
    return lambdaClient.session.countSessions.query(params);
  };

  rankSessions: ISessionService['rankSessions'] = async (limit) => {
    return lambdaClient.session.rankSessions.query(limit);
  };

  updateSession: ISessionService['updateSession'] = (id, data) => {
    const { group, pinned, meta, updatedAt } = data;
    return lambdaClient.session.updateSession.mutate({
      id,
      value: { groupId: group === 'default' ? null : group, pinned, ...meta, updatedAt },
    });
  };

  // TODO: Need to be fixed
  // @ts-ignore
  getSessionConfig: ISessionService['getSessionConfig'] = async (id) => {
    return lambdaClient.agent.getAgentConfig.query({ sessionId: id });
  };

  updateSessionConfig: ISessionService['updateSessionConfig'] = (id, config, signal) => {
    return lambdaClient.session.updateSessionConfig.mutate(
      { id, value: config },
      {
        context: { showNotification: false },
        signal,
      },
    );
  };

  updateSessionMeta: ISessionService['updateSessionMeta'] = (id, meta, signal) => {
    return lambdaClient.session.updateSessionConfig.mutate({ id, value: meta }, { signal });
  };

  updateSessionChatConfig: ISessionService['updateSessionChatConfig'] = (id, value, signal) => {
    return lambdaClient.session.updateSessionChatConfig.mutate({ id, value }, { signal });
  };

  // TODO: need be fixed
  // @ts-ignore
  getSessionsByType: ISessionService['getSessionsByType'] = (_type = 'all') => {
    return lambdaClient.session.getSessions.query({});
  };

  searchSessions: ISessionService['searchSessions'] = (keywords) => {
    return lambdaClient.session.searchSessions.query({ keywords });
  };

  removeSession: ISessionService['removeSession'] = (id) => {
    return lambdaClient.session.removeSession.mutate({ id });
  };

  removeAllSessions: ISessionService['removeAllSessions'] = () => {
    return lambdaClient.session.removeAllSessions.mutate();
  };

  // ************************************** //
  // ***********  SessionGroup  *********** //
  // ************************************** //

  createSessionGroup: ISessionService['createSessionGroup'] = (name, sort) => {
    return lambdaClient.sessionGroup.createSessionGroup.mutate({ name, sort });
  };

  getSessionGroups: ISessionService['getSessionGroups'] = () => {
    return lambdaClient.sessionGroup.getSessionGroup.query();
  };

  batchCreateSessionGroups: ISessionService['batchCreateSessionGroups'] = (_groups) => {
    return Promise.resolve({ added: 0, ids: [], skips: [], success: true });
  };

  removeSessionGroup: ISessionService['removeSessionGroup'] = (id, removeChildren) => {
    return lambdaClient.sessionGroup.removeSessionGroup.mutate({ id, removeChildren });
  };

  removeSessionGroups: ISessionService['removeSessionGroups'] = () => {
    return lambdaClient.sessionGroup.removeAllSessionGroups.mutate();
  };

  updateSessionGroup: ISessionService['updateSessionGroup'] = (id, value) => {
    return lambdaClient.sessionGroup.updateSessionGroup.mutate({ id, value });
  };

  updateSessionGroupOrder: ISessionService['updateSessionGroupOrder'] = (sortMap) => {
    return lambdaClient.sessionGroup.updateSessionGroupOrder.mutate({ sortMap });
  };
}
