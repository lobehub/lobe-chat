/* eslint-disable @typescript-eslint/no-unused-vars */
import { trpcClient } from '@/services/_auth/trpc';
import { ISessionService } from './type';

export class ServerService implements ISessionService {
  hasSessions: ISessionService['hasSessions'] = async () => {
    try {
      const result = await this.countSessions();
      return result > 0;
    } catch (error) {
      console.error('Failed to check sessions existence:', error);
      return false;
    }
  };

  createSession: ISessionService['createSession'] = async (type, data) => {
    try {
      const { config, group, meta, ...session } = data;
      return await trpcClient.session.createSession.mutate({
        config: { ...config, ...meta } as any,
        session: { ...session, groupId: group },
        type,
      });
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  };

  batchCreateSessions: ISessionService['batchCreateSessions'] = async (importSessions) => {
    try {
      // TODO: RN端暂未实现此功能 - 批量创建会话
      console.warn('batchCreateSessions not implemented in RN');
      return { added: 0, ids: [], skips: [], success: false };
    } catch (error) {
      console.error('Failed to batch create sessions:', error);
      throw error;
    }
  };

  cloneSession: ISessionService['cloneSession'] = async (id, newTitle) => {
    try {
      return await trpcClient.session.cloneSession.mutate({ id, newTitle });
    } catch (error) {
      console.error('Failed to clone session:', error);
      throw error;
    }
  };

  getGroupedSessions: ISessionService['getGroupedSessions'] = async () => {
    try {
      const result = await trpcClient.session.getGroupedSessions.query();
      return result || { sessionGroups: [], sessions: [] };
    } catch (error) {
      console.error('Failed to fetch grouped sessions:', error);
      throw error;
    }
  };

  countSessions: ISessionService['countSessions'] = async (params) => {
    try {
      return await trpcClient.session.countSessions.query(params);
    } catch (error) {
      console.error('Failed to count sessions:', error);
      throw error;
    }
  };

  rankSessions: ISessionService['rankSessions'] = async (limit) => {
    try {
      return await trpcClient.session.rankSessions.query(limit);
    } catch (error) {
      console.error('Failed to rank sessions:', error);
      throw error;
    }
  };

  updateSession: ISessionService['updateSession'] = async (id, data) => {
    try {
      const { group, pinned, meta, updatedAt } = data;
      return await trpcClient.session.updateSession.mutate({
        id,
        value: { groupId: group === 'default' ? null : group, pinned, ...meta, updatedAt },
      });
    } catch (error) {
      console.error('Failed to update session:', error);
      throw error;
    }
  };

  // TODO: Need to be fixed
  // @ts-ignore
  getSessionConfig: ISessionService['getSessionConfig'] = async (id) => {
    try {
      return await trpcClient.agent.getAgentConfig.query({ sessionId: id });
    } catch (error) {
      console.error('Failed to get session config:', error);
      throw error;
    }
  };

  updateSessionConfig: ISessionService['updateSessionConfig'] = async (id, config, signal) => {
    try {
      return await trpcClient.session.updateSessionConfig.mutate({ id, value: config }, { signal });
    } catch (error) {
      console.error('Failed to update session config:', error);
      throw error;
    }
  };

  updateSessionMeta: ISessionService['updateSessionMeta'] = async (id, meta, signal) => {
    try {
      return await trpcClient.session.updateSessionConfig.mutate({ id, value: meta }, { signal });
    } catch (error) {
      console.error('Failed to update session meta:', error);
      throw error;
    }
  };

  updateSessionChatConfig: ISessionService['updateSessionChatConfig'] = async (
    id,
    value,
    signal,
  ) => {
    try {
      return await trpcClient.session.updateSessionChatConfig.mutate({ id, value }, { signal });
    } catch (error) {
      console.error('Failed to update session chat config:', error);
      throw error;
    }
  };

  // TODO: need be fixed
  // @ts-ignore
  getSessionsByType: ISessionService['getSessionsByType'] = async (_type = 'all') => {
    try {
      return await trpcClient.session.getSessions.query({});
    } catch (error) {
      console.error('Failed to get sessions by type:', error);
      throw error;
    }
  };

  searchSessions: ISessionService['searchSessions'] = async (keywords) => {
    try {
      return await trpcClient.session.searchSessions.query({ keywords });
    } catch (error) {
      console.error('Failed to search sessions:', error);
      throw error;
    }
  };

  removeSession: ISessionService['removeSession'] = async (id) => {
    try {
      return await trpcClient.session.removeSession.mutate({ id });
    } catch (error) {
      console.error('Failed to remove session:', error);
      throw error;
    }
  };

  removeAllSessions: ISessionService['removeAllSessions'] = async () => {
    try {
      return await trpcClient.session.removeAllSessions.mutate();
    } catch (error) {
      console.error('Failed to remove all sessions:', error);
      throw error;
    }
  };

  // ************************************** //
  // ***********  SessionGroup  *********** //
  // ************************************** //

  createSessionGroup: ISessionService['createSessionGroup'] = async (name, sort) => {
    try {
      return await trpcClient.sessionGroup.createSessionGroup.mutate({ name, sort });
    } catch (error) {
      console.error('Failed to create session group:', error);
      throw error;
    }
  };

  getSessionGroups: ISessionService['getSessionGroups'] = async () => {
    try {
      return await trpcClient.sessionGroup.getSessionGroup.query();
    } catch (error) {
      console.error('Failed to get session groups:', error);
      throw error;
    }
  };

  batchCreateSessionGroups: ISessionService['batchCreateSessionGroups'] = async (_groups) => {
    try {
      // TODO: RN端暂未实现此功能 - 批量创建分组
      console.warn('batchCreateSessionGroups not implemented in RN');
      return { added: 0, ids: [], skips: [], success: false };
    } catch (error) {
      console.error('Failed to batch create session groups:', error);
      throw error;
    }
  };

  removeSessionGroup: ISessionService['removeSessionGroup'] = async (id, removeChildren) => {
    try {
      return await trpcClient.sessionGroup.removeSessionGroup.mutate({ id, removeChildren });
    } catch (error) {
      console.error('Failed to remove session group:', error);
      throw error;
    }
  };

  removeSessionGroups: ISessionService['removeSessionGroups'] = async () => {
    try {
      return await trpcClient.sessionGroup.removeAllSessionGroups.mutate();
    } catch (error) {
      console.error('Failed to remove session groups:', error);
      throw error;
    }
  };

  updateSessionGroup: ISessionService['updateSessionGroup'] = async (id, value) => {
    try {
      return await trpcClient.sessionGroup.updateSessionGroup.mutate({ id, value });
    } catch (error) {
      console.error('Failed to update session group:', error);
      throw error;
    }
  };

  updateSessionGroupOrder: ISessionService['updateSessionGroupOrder'] = async (sortMap) => {
    try {
      return await trpcClient.sessionGroup.updateSessionGroupOrder.mutate({ sortMap });
    } catch (error) {
      console.error('Failed to update session group order:', error);
      throw error;
    }
  };
}
