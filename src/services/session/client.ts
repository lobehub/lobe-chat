import { INBOX_SESSION_ID } from '@/const/session';
import { clientDB } from '@/database/client/db';
import { SessionModel } from '@/database/models/session';
import { SessionGroupModel } from '@/database/models/sessionGroup';
import { AgentItem } from '@/database/schemas';
import { BaseClientService } from '@/services/baseClientService';
import { LobeAgentConfig } from '@/types/agent';

import { ISessionService } from './type';

export class ClientService extends BaseClientService implements ISessionService {
  private get sessionModel(): SessionModel {
    return new SessionModel(clientDB as any, this.userId);
  }

  private get sessionGroupModel(): SessionGroupModel {
    return new SessionGroupModel(clientDB as any, this.userId);
  }

  hasSessions: ISessionService['hasSessions'] = async () => {
    const result = await this.countSessions();
    return result === 0;
  };

  createSession: ISessionService['createSession'] = async (type, data) => {
    const { config, group, meta, ...session } = data;

    const item = await this.sessionModel.create({
      config: { ...config, ...meta } as any,
      session: { ...session, groupId: group },
      type,
    });
    if (!item) {
      throw new Error('session create Error');
    }
    return item.id;
  };

  batchCreateSessions: ISessionService['batchCreateSessions'] = async (importSessions) => {
    // @ts-ignore
    return this.sessionModel.batchCreate(importSessions);
  };

  cloneSession: ISessionService['cloneSession'] = async (id, newTitle) => {
    const res = await this.sessionModel.duplicate(id, newTitle);

    if (res) return res?.id;
  };

  getGroupedSessions: ISessionService['getGroupedSessions'] = async () => {
    return this.sessionModel.queryWithGroups();
  };

  getSessionConfig: ISessionService['getSessionConfig'] = async (id) => {
    if (id === INBOX_SESSION_ID) {
      const item = await this.sessionModel.findByIdOrSlug(INBOX_SESSION_ID);

      // if there is no session for user, create one
      if (!item) {
        const defaultAgentConfig =
          window.global_serverConfigStore.getState().serverConfig.defaultAgent?.config || {};

        await this.sessionModel.createInbox(defaultAgentConfig);
      }
    }

    const res = await this.sessionModel.findByIdOrSlug(id);

    if (!res) throw new Error('Session not found');

    return res.agent as LobeAgentConfig;
  };

  /**
   * 这个方法要对应移除的
   */
  // @ts-ignore
  getSessionsByType: ISessionService['getSessionsByType'] = async (type = 'all') => {
    switch (type) {
      // TODO: add a filter to get only agents or agents
      case 'group':
      case 'agent':
      case 'all': {
        return this.sessionModel.query();
      }
    }
  };

  countSessions: ISessionService['countSessions'] = async (params) => {
    return this.sessionModel.count(params);
  };

  rankSessions: ISessionService['rankSessions'] = async (limit) => {
    return this.sessionModel.rank(limit);
  };

  searchSessions: ISessionService['searchSessions'] = async (keyword) => {
    return this.sessionModel.queryByKeyword(keyword);
  };

  updateSession: ISessionService['updateSession'] = async (id, value) => {
    return this.sessionModel.update(id, {
      ...value,
      groupId: value.group === 'default' ? null : value.group,
    });
  };

  updateSessionConfig: ISessionService['updateSessionConfig'] = async (activeId, config) => {
    const session = await this.sessionModel.findByIdOrSlug(activeId);
    if (!session || !config) return;

    return this.sessionModel.updateConfig(session.agent.id, config as AgentItem);
  };

  updateSessionMeta: ISessionService['updateSessionMeta'] = async (activeId, meta) => {
    // inbox 不允许修改 meta
    if (activeId === INBOX_SESSION_ID) return;

    return this.sessionModel.update(activeId, meta);
  };

  updateSessionChatConfig: ISessionService['updateSessionChatConfig'] = async (
    activeId,
    config,
  ) => {
    return this.updateSessionConfig(activeId, { chatConfig: config });
  };

  removeSession: ISessionService['removeSession'] = async (id) => {
    return this.sessionModel.delete(id);
  };

  removeAllSessions: ISessionService['removeAllSessions'] = async () => {
    return this.sessionModel.deleteAll();
  };

  // ************************************** //
  // ***********  SessionGroup  *********** //
  // ************************************** //

  createSessionGroup: ISessionService['createSessionGroup'] = async (name, sort) => {
    const item = await this.sessionGroupModel.create({ name, sort });
    if (!item) {
      throw new Error('session group create Error');
    }

    return item.id;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  batchCreateSessionGroups: ISessionService['batchCreateSessionGroups'] = async (_groups) => {
    return { added: 0, ids: [], skips: [], success: true };
  };

  removeSessionGroup: ISessionService['removeSessionGroup'] = async (id) => {
    return this.sessionGroupModel.delete(id);
  };

  updateSessionGroup: ISessionService['updateSessionGroup'] = async (id, data) => {
    return this.sessionGroupModel.update(id, data);
  };

  updateSessionGroupOrder: ISessionService['updateSessionGroupOrder'] = async (sortMap) => {
    return this.sessionGroupModel.updateOrder(sortMap);
  };

  getSessionGroups: ISessionService['getSessionGroups'] = async () => {
    return this.sessionGroupModel.query();
  };

  removeSessionGroups: ISessionService['removeSessionGroups'] = async () => {
    return this.sessionGroupModel.deleteAll();
  };
}
