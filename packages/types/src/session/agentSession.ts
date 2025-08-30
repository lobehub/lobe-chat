import { LobeAgentConfig } from '../agent';
import { MetaData } from '../meta';

export type SessionGroupId = 'default' | 'pinned' | string;

export enum LobeSessionType {
  Agent = 'agent',
  Group = 'group',
}

/**
 * Lobe Agent
 */
export interface LobeAgentSession {
  config: LobeAgentConfig;
  createdAt: Date;
  group?: SessionGroupId;
  id: string;
  meta: MetaData;
  model: string;
  pinned?: boolean;
  tags?: string[];
  type: LobeSessionType.Agent;
  updatedAt: Date;
}

export interface LobeAgentSettings {
  /**
   * 语言模型角色设定
   */
  config: LobeAgentConfig;
  meta: MetaData;
}

export type LobeSessions = LobeAgentSession[];
