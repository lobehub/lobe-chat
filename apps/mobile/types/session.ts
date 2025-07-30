import { z } from 'zod';
import { LobeAgentConfig } from '@/mobile/types/agent';

export interface SessionGroupItem {
  createdAt: Date;
  id: string;
  name: string;
  sort?: number | null;
  updatedAt: Date;
}
export enum LobeSessionType {
  Agent = 'agent',
  Group = 'group',
}

export enum SessionDefaultGroup {
  Default = 'default',
  Pinned = 'pinned',
}

export type SessionGroupId = SessionDefaultGroup | string;

export const LobeMetaDataSchema = z.object({
  /**
   * 角色作者
   */
  author: z.string().optional(),

  /**
   * 角色头像
   */
  avatar: z.string().optional(),

  /**
   *  背景色
   */
  backgroundColor: z.string().optional(),

  /**
   * 角色描述
   */
  description: z.string().optional(),

  /**
   * 角色标签
   */
  tags: z.array(z.string()).optional(),

  /**
   * 名称
   */
  title: z.string().optional(),
});

export type MetaData = z.infer<typeof LobeMetaDataSchema>;

/**
 * Lobe Agent
 */
export interface LobeAgentSession {
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
export type LobeSessionGroups = SessionGroupItem[];

export type LobeSessions = LobeAgentSession[];

export interface LobeAgentSettings {
  /**
   * 语言模型角色设定
   */
  config: LobeAgentConfig;
  meta: MetaData;
}

export interface ChatSessionList {
  sessionGroups: LobeSessionGroups;
  sessions: LobeSessions;
}
