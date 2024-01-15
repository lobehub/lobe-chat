import { LobeAgentConfig } from '@/types/agent';

import { BaseDataModel, MetaData } from './meta';

export enum LobeSessionType {
  Agent = 'agent',
  Group = 'group',
}

export type SessionGroupId = SessionDefaultGroup | string;

export enum SessionDefaultGroup {
  Default = 'default',
  Pinned = 'pinned',
}

export interface SessionGroupItem {
  id: SessionGroupId;
  name: string;
}

/**
 * Lobe Agent
 */
export interface LobeAgentSession extends BaseDataModel {
  config: LobeAgentConfig;
  group?: SessionGroupId;
  type: LobeSessionType.Agent;
}

export interface LobeAgentSettings {
  /**
   * 语言模型角色设定
   */
  config: LobeAgentConfig;
  meta: MetaData;
}

export type LobeSessions = LobeAgentSession[];
