'use client';

import isEqual from 'fast-deep-equal';
import React, { memo } from 'react';

import { DEFAULT_AVATAR } from '@/const/meta';
import GroupAvatar from '@/features/GroupAvatar';
import { useAgentGroupStore } from '@/store/agentGroup';
import { agentGroupSelectors } from '@/store/agentGroup/selectors';

const SupervisorAvatar = memo<{ size?: number }>(({ size = 28 }) => {
  const agents = useAgentGroupStore((s) => agentGroupSelectors.currentGroupAgents(s), isEqual);

  return (
    <GroupAvatar
      avatars={agents.map((agent) => ({
        avatar: agent.avatar || DEFAULT_AVATAR,
        background: agent.backgroundColor || undefined,
      }))}
      size={size}
    />
  );
});

export default SupervisorAvatar;
