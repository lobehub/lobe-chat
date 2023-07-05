import { LanguageModel } from '@/types/llm';
import { LobeAgentSession } from '@/types/session';

export interface SessionLoadingState {
  pickingEmojiAvatar: boolean;
  summarizingDescription: boolean;
  summarizingTitle: boolean;
}

export interface SessionState {
  /**
   * @title 当前活动的会话
   * @description 当前正在编辑或查看的会话
   * @default null
   */
  activeId: string | null;
  loading: SessionLoadingState;
  searchKeywords: string;
  sessions: Record<string, LobeAgentSession>;
}

export const initLobeSessionAgent: LobeAgentSession = {
  chats: {},
  config: {
    model: LanguageModel.GPT3_5,
    params: { temperature: 0.6 },
    systemRole: '',
  },
  id: '',
  meta: {},
};

export const initialSessionState: SessionState = {
  activeId: null,

  // loading 中间态
  loading: {
    pickingEmojiAvatar: false,
    summarizingDescription: false,
    summarizingTitle: false,
  },

  searchKeywords: '',

  sessions: {},
};
