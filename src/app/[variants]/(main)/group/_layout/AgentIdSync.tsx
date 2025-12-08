import { useLoaderData } from 'react-router-dom';
import { createStoreUpdater } from 'zustand-utils';

import { useAgentStore } from '@/store/agent';
import { useChatStore } from '@/store/chat';

const AgentIdSync = () => {
  const useStoreUpdater = createStoreUpdater(useAgentStore);
  const useChatStoreUpdater = createStoreUpdater(useChatStore);
  const load = useLoaderData();

  useStoreUpdater('activeAgentId', load?.agentId);
  useChatStoreUpdater('activeAgentId', load?.agentId);

  return null;
};

export default AgentIdSync;
