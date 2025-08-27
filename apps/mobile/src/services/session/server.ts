/* eslint-disable @typescript-eslint/no-unused-vars */
import { trpcClient } from '@/services/_auth/trpc';
import { ISessionService } from './type';

export class ServerService implements ISessionService {
  hasSessions: ISessionService['hasSessions'] = async () => {
    const result = await this.countSessions();
    return result === 0;
  };

  createSession: ISessionService['createSession'] = async (type, data) => {
    const { config, group, meta, ...session } = data;
    return trpcClient.session.createSession.mutate({
      config: { ...config, ...meta } as any,
      session: { ...session, groupId: group },
      type,
    });
  };

  batchCreateSessions: ISessionService['batchCreateSessions'] = async (importSessions) => {
    // TODO: remove any
    const data = await trpcClient.session.batchCreateSessions.mutate(importSessions as any);
    console.log(data);
    return data;
  };

  cloneSession: ISessionService['cloneSession'] = (id, newTitle) => {
    return trpcClient.session.cloneSession.mutate({ id, newTitle });
  };

  getGroupedSessions: ISessionService['getGroupedSessions'] = () => {
    return trpcClient.session.getGroupedSessions.query();
  };

  countSessions: ISessionService['countSessions'] = async (params) => {
    return trpcClient.session.countSessions.query(params);
  };

  rankSessions: ISessionService['rankSessions'] = async (limit) => {
    return trpcClient.session.rankSessions.query(limit);
  };

  updateSession: ISessionService['updateSession'] = (id, data) => {
    const { group, pinned, meta, updatedAt } = data;
    return trpcClient.session.updateSession.mutate({
      id,
      value: { groupId: group === 'default' ? null : group, pinned, ...meta, updatedAt },
    });
  };

  // TODO: Need to be fixed
  // @ts-ignore
  getSessionConfig: ISessionService['getSessionConfig'] = async (id) => {
    return trpcClient.agent.getAgentConfig.query({ sessionId: id });
  };

  updateSessionConfig: ISessionService['updateSessionConfig'] = (id, config, signal) => {
    return trpcClient.session.updateSessionConfig.mutate({ id, value: config }, { signal });
  };

  updateSessionMeta: ISessionService['updateSessionMeta'] = (id, meta, signal) => {
    return trpcClient.session.updateSessionConfig.mutate({ id, value: meta }, { signal });
  };

  updateSessionChatConfig: ISessionService['updateSessionChatConfig'] = (id, value, signal) => {
    return trpcClient.session.updateSessionChatConfig.mutate({ id, value }, { signal });
  };

  // TODO: need be fixed
  // @ts-ignore
  getSessionsByType: ISessionService['getSessionsByType'] = (_type = 'all') => {
    return trpcClient.session.getSessions.query({});
  };

  searchSessions: ISessionService['searchSessions'] = (keywords) => {
    return trpcClient.session.searchSessions.query({ keywords });
  };

  removeSession: ISessionService['removeSession'] = (id) => {
    return trpcClient.session.removeSession.mutate({ id });
  };

  removeAllSessions: ISessionService['removeAllSessions'] = () => {
    return trpcClient.session.removeAllSessions.mutate();
  };

  // ************************************** //
  // ***********  SessionGroup  *********** //
  // ************************************** //

  createSessionGroup: ISessionService['createSessionGroup'] = (name, sort) => {
    return trpcClient.sessionGroup.createSessionGroup.mutate({ name, sort });
  };

  getSessionGroups: ISessionService['getSessionGroups'] = () => {
    return trpcClient.sessionGroup.getSessionGroup.query();
  };

  batchCreateSessionGroups: ISessionService['batchCreateSessionGroups'] = (_groups) => {
    return Promise.resolve({ added: 0, ids: [], skips: [], success: true });
  };

  removeSessionGroup: ISessionService['removeSessionGroup'] = (id, removeChildren) => {
    return trpcClient.sessionGroup.removeSessionGroup.mutate({ id, removeChildren });
  };

  removeSessionGroups: ISessionService['removeSessionGroups'] = () => {
    return trpcClient.sessionGroup.removeAllSessionGroups.mutate();
  };

  updateSessionGroup: ISessionService['updateSessionGroup'] = (id, value) => {
    return trpcClient.sessionGroup.updateSessionGroup.mutate({ id, value });
  };

  updateSessionGroupOrder: ISessionService['updateSessionGroupOrder'] = (sortMap) => {
    return trpcClient.sessionGroup.updateSessionGroupOrder.mutate({ sortMap });
  };
}
