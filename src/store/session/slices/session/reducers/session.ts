import { produce } from 'immer';

import { ChatMessageMap } from '@/types/chatMessage';
import { MetaData } from '@/types/meta';
import { LobeAgentConfig, LobeAgentSession, LobeSessions } from '@/types/session';
import { ChatTopicMap } from '@/types/topic';

/**
 * @title 添加会话
 */
interface AddSession {
  /**
   * @param session - 会话信息
   */
  session: LobeAgentSession;
  /**
   * @param type - 操作类型
   * @default 'addChat'
   */
  type: 'addSession';
}

interface RemoveSession {
  id: string;
  type: 'removeSession';
}

/**
 * @title 更新会话聊天上下文
 */
interface UpdateSessionChat {
  chats: ChatMessageMap;
  /**
   * 会话 ID
   */
  id: string;

  type: 'updateSessionChat';
}

/**
 * @title 更新会话聊天上下文
 */
interface UpdateSessionTopic {
  /**
   * 会话 ID
   */
  id: string;
  topics: ChatTopicMap;

  type: 'updateSessionTopic';
}

interface UpdateSessionMeta {
  id: string;
  key: keyof MetaData;
  type: 'updateSessionMeta';
  value: any;
}

interface UpdateSessionAgentConfig {
  config: Partial<LobeAgentConfig>;
  id: string;
  type: 'updateSessionConfig';
}
interface ToggleSessionPinned {
  id: string;
  pinned: boolean;
  type: 'toggleSessionPinned';
}

export type SessionDispatch =
  | AddSession
  | UpdateSessionChat
  | RemoveSession
  | UpdateSessionMeta
  | UpdateSessionAgentConfig
  | UpdateSessionTopic
  | ToggleSessionPinned;

export const sessionsReducer = (state: LobeSessions, payload: SessionDispatch): LobeSessions => {
  switch (payload.type) {
    case 'addSession': {
      return produce(state, (draft) => {
        const { session } = payload;
        if (!session) return;

        draft[session.id] = session;
      });
    }

    case 'removeSession': {
      return produce(state, (draft) => {
        delete draft[payload.id];
      });
    }

    case 'toggleSessionPinned': {
      return produce(state, (draft) => {
        const { pinned, id } = payload;
        const session = draft[id];
        if (!session) return;

        session.pinned = pinned;
      });
    }

    case 'updateSessionMeta': {
      return produce(state, (draft) => {
        const chat = draft[payload.id];
        if (!chat) return;

        const { key, value } = payload;

        const validKeys = ['avatar', 'backgroundColor', 'description', 'tags', 'title'];

        if (validKeys.includes(key)) chat.meta[key] = value;
      });
    }

    case 'updateSessionChat': {
      return produce(state, (draft) => {
        const chat = draft[payload.id];
        if (!chat) return;

        chat.chats = payload.chats;
      });
    }

    case 'updateSessionTopic': {
      return produce(state, (draft) => {
        const chat = draft[payload.id];
        if (!chat) return;

        chat.topics = payload.topics;
      });
    }

    case 'updateSessionConfig': {
      return produce(state, (draft) => {
        const { id, config } = payload;
        const chat = draft[id];
        if (!chat) return;

        chat.config = {
          ...chat.config,
          ...config,
          params: { ...chat.config.params, ...config.params },
        };
      });
    }

    default: {
      return produce(state, () => {});
    }
  }
};
