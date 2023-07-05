import { produce } from 'immer';
import { Md5 } from 'ts-md5';
import { v4 as uuid } from 'uuid';

import { LanguageModel } from '@/types/llm';
import { LobeAgentSession } from '@/types/session';

interface AddAgentAction {
  avatar?: string;
  content: string;
  id?: string;
  title?: string;
  type: 'addAgent';
}
interface RemoveAgentAction {
  id: string;
  type: 'removeAgent';
}
interface UpdateAgentData {
  id: string;
  key: keyof Omit<LobeAgentSession, 'hash' | 'id' | 'model' | 'flow'>;
  type: 'updateAgentData';
  value: any;
}

export type AgentDispatch = AddAgentAction | RemoveAgentAction | UpdateAgentData;

// TODO: 临时修正 types
type ChatAgentMap = any;
type ChatAgent = any;

export const agentsReducer = (state: ChatAgentMap, payload: AgentDispatch): ChatAgentMap => {
  switch (payload.type) {
    case 'addAgent': {
      return produce(state, (draft) => {
        const { avatar, id, content, title } = payload;
        const newAgent: ChatAgent = {
          avatar,
          content,
          hash: Md5.hashStr(content),
          id: id ?? uuid(),
          model: LanguageModel.GPT3_5,
          title,
        };

        draft[newAgent.id] = newAgent;
      });
    }

    case 'removeAgent': {
      return produce(state, (draftState) => {
        delete draftState[payload.id];
      });
    }

    case 'updateAgentData': {
      return produce(state, (draft) => {
        const { id, key, value } = payload;
        const agent = draft[id];
        if (!agent) return;

        agent[key] = value as never;

        if (key === 'content') {
          agent.hash = Md5.hashStr(value);
        }

        agent.updateAt = Date.now();
      });
    }

    default: {
      throw new Error('不存在的 type，请检查代码实现...');
    }
  }
};
