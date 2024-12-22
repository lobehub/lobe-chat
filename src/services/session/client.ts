import { DeepPartial } from 'utility-types';

import { INBOX_SESSION_ID } from '@/const/session';
import { clientDB } from '@/database/client/db';
import { AgentItem } from '@/database/schemas';
import { SessionModel } from '@/database/server/models/session';
import { SessionGroupModel } from '@/database/server/models/sessionGroup';
import { BaseClientService } from '@/services/baseClientService';
import { LobeAgentChatConfig, LobeAgentConfig } from '@/types/agent';
import { MetaData } from '@/types/meta';
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

export class ClientService extends BaseClientService implements ISessionService {
  private get sessionModel(): SessionModel {
    return new SessionModel(clientDB as any, this.userId);
  }

  private get sessionGroupModel(): SessionGroupModel {
    return new SessionGroupModel(clientDB as any, this.userId);
  }

  async createSession(type: LobeSessionType, data: Partial<LobeAgentSession>): Promise<string> {
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
  }

  async batchCreateSessions(importSessions: LobeSessions) {
    // @ts-ignore
    return this.sessionModel.batchCreate(importSessions);
  }

  async cloneSession(id: string, newTitle: string): Promise<string | undefined> {
    const res = await this.sessionModel.duplicate(id, newTitle);

    if (res) return res?.id;
  }

  async getGroupedSessions(): Promise<ChatSessionList> {
    return this.sessionModel.queryWithGroups();
  }

  async getSessionConfig(id: string): Promise<LobeAgentConfig> {
    const res = await this.sessionModel.findByIdOrSlug(id);

    if (!res) throw new Error('Session not found');

    return res.agent as LobeAgentConfig;
  }

  /**
   * 这个方法要对应移除的
   */
  async getSessionsByType(type: 'agent' | 'group' | 'all' = 'all'): Promise<LobeSessions> {
    switch (type) {
      // TODO: add a filter to get only agents or agents
      case 'group': {
        // @ts-ignore
        return this.sessionModel.query();
      }
      case 'agent': {
        // @ts-ignore
        return this.sessionModel.query();
      }

      case 'all': {
        // @ts-ignore
        return this.sessionModel.query();
      }
    }
  }

  async countSessions() {
    return this.sessionModel.count();
  }

  async searchSessions(keyword: string) {
    return this.sessionModel.queryByKeyword(keyword);
  }

  async updateSession(id: string, value: Partial<UpdateSessionParams>) {
    return this.sessionModel.update(id, {
      ...value,
      groupId: value.group === 'default' ? null : value.group,
    });
  }

  async updateSessionConfig(
    activeId: string,
    config: DeepPartial<LobeAgentConfig>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _?: AbortSignal,
  ) {
    const session = await this.sessionModel.findByIdOrSlug(activeId);
    if (!session || !config) return;

    return this.sessionModel.updateConfig(session.agent.id, config as AgentItem);
  }

  async updateSessionMeta(
    activeId: string,
    meta: Partial<MetaData>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _?: AbortSignal,
  ) {
    // inbox 不允许修改 meta
    if (activeId === INBOX_SESSION_ID) return;

    return this.sessionModel.update(activeId, meta);
  }

  async updateSessionChatConfig(
    activeId: string,
    config: DeepPartial<LobeAgentChatConfig>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _?: AbortSignal,
  ) {
    return this.updateSessionConfig(activeId, { chatConfig: config });
  }

  async removeSession(id: string) {
    return this.sessionModel.delete(id);
  }

  async removeAllSessions() {
    return this.sessionModel.deleteAll();
  }

  // ************************************** //
  // ***********  SessionGroup  *********** //
  // ************************************** //

  async createSessionGroup(name: string, sort?: number) {
    const item = await this.sessionGroupModel.create({ name, sort });
    if (!item) {
      throw new Error('session group create Error');
    }

    return item.id;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async batchCreateSessionGroups(_groups: SessionGroups) {
    return { added: 0, ids: [], skips: [], success: true };
  }

  async removeSessionGroup(id: string) {
    return await this.sessionGroupModel.delete(id);
  }

  async updateSessionGroup(id: string, data: Partial<SessionGroupItem>) {
    return this.sessionGroupModel.update(id, data);
  }

  async updateSessionGroupOrder(sortMap: { id: string; sort: number }[]) {
    return this.sessionGroupModel.updateOrder(sortMap);
  }

  async getSessionGroups(): Promise<SessionGroupItem[]> {
    return this.sessionGroupModel.query();
  }

  async removeSessionGroups() {
    return this.sessionGroupModel.deleteAll();
  }
}
