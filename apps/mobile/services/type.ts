/* eslint-disable @typescript-eslint/no-unused-vars */
import { LobeAgentSession } from '@/mobile/types/session';

export interface ISessionService {
  getGroupedSessions: () => Promise<{
    sessionGroups: any[];
    sessions: LobeAgentSession[];
  }>;
  // getSessionGroups(): Promise<SessionGroupItem[]>;
}

export interface IAgentService {
  /**
   * 获取助手详情
   * @param identifier 助手标识符
   */
  getAgentDetail: (identifier: string) => Promise<any>;

  /**
   * 获取助手列表
   */
  getAgentList: () => Promise<any>;
}
