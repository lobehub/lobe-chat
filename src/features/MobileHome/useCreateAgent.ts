import { useState } from 'react';

import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { usePermission } from '@/hooks/usePermission';
import { useAgentStore } from '@/store/agent';
import { useHomeStore } from '@/store/home';

export const useCreateAgent = () => {
  const { allowed, reason } = usePermission('create_content');
  const createAgent = useAgentStore((s) => s.createAgent);
  const [refreshAgentList, pinAgent] = useHomeStore((s) => [s.refreshAgentList, s.pinAgent]);
  const navigate = useWorkspaceAwareNavigate();
  const [loading, setLoading] = useState(false);

  const create = async (options?: {
    groupId?: string;
    pinned?: boolean;
    visibility?: 'private' | 'public';
  }) => {
    if (!allowed || loading) return;
    setLoading(true);
    try {
      const { agentId } = await createAgent({
        groupId: options?.groupId,
        visibility: options?.visibility,
      });
      if (options?.pinned) await pinAgent(agentId, true);
      else await refreshAgentList();
      navigate(`/agent/${agentId}`);
    } finally {
      setLoading(false);
    }
  };
  return { allowed, create, loading, reason };
};
