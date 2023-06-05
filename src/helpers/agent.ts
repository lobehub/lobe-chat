import { initialAgent } from '@/store/session/initialState';
import { ChatAgent, ChatAgentMap } from '@/types';
import { Md5 } from 'ts-md5';

/**
 * 结合 agents 判断是否是已存在的 agent
 * @param agents
 * @param agent
 */
export const getUniqueAgent = (agents: ChatAgentMap, agent: Pick<ChatAgent, 'content'>) => {
  const existAgent = Object.values(agents).find((a) => a.hash === Md5.hashStr(agent.content));

  return {
    agent: (existAgent ?? agent) as ChatAgent,
    isExist: !!existAgent,
  };
};

export const getSafeAgent = (agents: ChatAgentMap, id?: string | null) => {
  if (!id || !agents[id]) return initialAgent;

  const agent = agents[id];

  return agent;
};
