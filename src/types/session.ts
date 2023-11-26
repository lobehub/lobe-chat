import { LobeAgentConfig } from '@/types/agent';

import { BaseDataModel, MetaData } from './meta';

export enum LobeSessionType {
  Agent = 'agent',
  Group = 'group',
}

export type SessionGroupKey = 'pinned' | 'default' | string;

export enum SessionGroupDefaultKeys {
  Default = 'default',
  Pinned = 'pinned',
}

/**
 * Lobe Agent
 */
export interface LobeAgentSession extends BaseDataModel {
  config: LobeAgentConfig;
  group?: SessionGroupKey;
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
