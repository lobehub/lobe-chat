'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';

import SkeletonList from '@/features/NavPanel/components/SkeletonList';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

const GroupConfig = dynamic(() => import('../../../_layout/Sidebar/GroupConfig'), {
  loading: () => <SkeletonList />,
  ssr: false,
});

const ConfigSwitcher = memo(() => {
  const isInbox = useSessionStore(sessionSelectors.isInboxSession);
  const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);
  if (isInbox) return;
  if (isGroupSession) return <GroupConfig />;

  return;
});

ConfigSwitcher.displayName = 'ConfigSwitcher';

export default ConfigSwitcher;
