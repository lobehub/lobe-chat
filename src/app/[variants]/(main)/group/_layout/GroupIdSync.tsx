import { useLoaderData } from 'react-router-dom';
import { createStoreUpdater } from 'zustand-utils';

import { useAgentGroupStore } from '@/store/agentGroup';
import { useChatStore } from '@/store/chat';

const GroupIdSync = () => {
  const useStoreUpdater = createStoreUpdater(useAgentGroupStore);
  const useChatStoreUpdater = createStoreUpdater(useChatStore);
  const load = useLoaderData();

  useStoreUpdater('activeGroupId', load?.groupId);
  useChatStoreUpdater('activeGroupId', load?.groupId);

  return null;
};

export default GroupIdSync;
