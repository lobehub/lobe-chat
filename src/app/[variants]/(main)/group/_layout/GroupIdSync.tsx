import { useUnmount } from 'ahooks';
import { useLoaderData } from 'react-router-dom';
import { createStoreUpdater } from 'zustand-utils';

import { useAgentGroupStore } from '@/store/agentGroup';
import { useChatStore } from '@/store/chat';

const GroupIdSync = () => {
  const useAgentGroupStoreUpdater = createStoreUpdater(useAgentGroupStore);
  const useChatStoreUpdater = createStoreUpdater(useChatStore);
  const load = useLoaderData();

  // Sync groupId to agentGroupStore and chatStore
  useAgentGroupStoreUpdater('activeGroupId', load?.groupId);
  useChatStoreUpdater('activeGroupId', load?.groupId);

  // Clear activeGroupId when unmounting (leaving group page)
  useUnmount(() => {
    useAgentGroupStore.setState({ activeGroupId: undefined });
    useChatStore.setState({ activeGroupId: undefined });
  });

  return null;
};

export default GroupIdSync;
