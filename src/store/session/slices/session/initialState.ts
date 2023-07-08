import { LanguageModel } from '@/types/llm';
import { LobeAgentConfig, LobeAgentSession, LobeSessionType } from '@/types/session';

export interface SessionState {
  /**
   * @title 当前活动的会话
   * @description 当前正在编辑或查看的会话
   * @default null
   */
  activeId: string | null;
  searchKeywords: string;
  sessions: Record<string, LobeAgentSession>;
}

export const initialLobeAgentConfig: LobeAgentConfig = {
  model: LanguageModel.GPT3_5,
  params: { temperature: 0.6 },
  systemRole: '',
};

export const initLobeSession: LobeAgentSession = {
  chats: {},
  config: initialLobeAgentConfig,
  createAt: Date.now(),
  id: '',
  meta: {},
  type: LobeSessionType.Agent,
  updateAt: Date.now(),
};

export const initialSessionState: SessionState = {
  activeId: null,

  searchKeywords: '',
  sessions: {},
};
