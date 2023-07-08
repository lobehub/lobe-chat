import { ChatMessageMap } from '@/types/chatMessage';
import { MetaData } from '@/types/meta';
import { LobeAgentConfig, LobeAgentSession, LobeSessions } from '@/types/session';
import { produce } from 'immer';

/**
 * @title 添加会话
 */
interface AddSession {
  /**
   * @param type - 操作类型
   * @default 'addChat'
   */
  type: 'addSession';
  /**
   * @param session - 会话信息
   */
  session: LobeAgentSession;
}

interface RemoveSession {
  type: 'removeSession';
  id: string;
}

/**
 * @title 更新会话聊天上下文
 */
interface UpdateSessionChat {
  type: 'updateSessionChat';
  /**
   * 会话 ID
   */
  id: string;

  chats: ChatMessageMap;
}

interface UpdateSessionMeta {
  type: 'updateSessionMeta';
  id: string;
  key: keyof MetaData;
  value: any;
}

interface UpdateSessionAgentConfig {
  type: 'updateSessionConfig';
  id: string;
  config: Partial<LobeAgentConfig>;
}

export type SessionDispatch =
  | AddSession
  | UpdateSessionChat
  | RemoveSession
  | UpdateSessionMeta
  | UpdateSessionAgentConfig;

export const sessionsReducer = (state: LobeSessions, payload: SessionDispatch): LobeSessions => {
  switch (payload.type) {
    case 'addSession':
      return produce(state, (draft) => {
        draft[payload.session.id] = payload.session;
      });

    case 'removeSession':
      return produce(state, (draft) => {
        delete draft[payload.id];
      });

    case 'updateSessionMeta':
      return produce(state, (draft) => {
        const chat = draft[payload.id];
        if (!chat) return;

        const { key, value } = payload;

        chat.meta[key] = value;
      });

    case 'updateSessionChat':
      return produce(state, (draft) => {
        const chat = draft[payload.id];
        if (!chat) return;

        chat.chats = payload.chats;
      });

    case 'updateSessionConfig':
      return produce(state, (draft) => {
        const { id, config } = payload;
        const chat = draft[id];
        if (!chat) return;

        chat.config = { ...chat.config, ...config };
      });

    default:
      return produce(state, () => {});
  }
};
