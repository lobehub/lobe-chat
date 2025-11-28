'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';

import SkeletonList from '@/features/NavPanel/Body/SkeletonList';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

const AgentConfig = dynamic(() => import('./AgentConfig'), {
  loading: () => <SkeletonList />,
  ssr: false,
});

const GroupConfig = dynamic(() => import('./GroupConfig'), {
  loading: () => <SkeletonList />,
  ssr: false,
});

const ConfigSwitcher = memo(() => {
  const { isAgentEditable: showSystemRole } = useServerConfigStore(featureFlagsSelectors);
  const isInbox = useSessionStore(sessionSelectors.isInboxSession);
  const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);

  if (isInbox) return;
  if (isGroupSession) return <GroupConfig />;
  if (showSystemRole) return <AgentConfig />;
  return;
});

ConfigSwitcher.displayName = 'ConfigSwitcher';

export default ConfigSwitcher;
