import { LanguageModel } from '@/types/llm';
import { LobeAgentSession } from '@/types/session';
import { produce } from 'immer';
import { Md5 } from 'ts-md5';
import { v4 as uuid } from 'uuid';

interface AddAgentAction {
  type: 'addAgent';
  id?: string;
  title?: string;
  content: string;
  avatar?: string;
}
interface RemoveAgentAction {
  type: 'removeAgent';
  id: string;
}
interface UpdateAgentData {
  type: 'updateAgentData';
  id: string;
  key: keyof Omit<LobeAgentSession, 'hash' | 'id' | 'model' | 'flow'>;
  value: any;
}

export type AgentDispatch = AddAgentAction | RemoveAgentAction | UpdateAgentData;

export const agentsReducer = (state: ChatAgentMap, payload: AgentDispatch): ChatAgentMap => {
  switch (payload.type) {
    case 'addAgent':
      return produce(state, (draft) => {
        const { avatar, id, content, title } = payload;
        const newAgent: ChatAgent = {
          id: id ?? uuid(),
          title,
          content,
          hash: Md5.hashStr(content),
          avatar,
          model: LanguageModel.GPT3_5,
        };

        draft[newAgent.id] = newAgent;
      });

    case 'removeAgent':
      return produce(state, (draftState) => {
        delete draftState[payload.id];
      });

    case 'updateAgentData':
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

    default:
      throw Error('不存在的 type，请检查代码实现...');
  }
};
