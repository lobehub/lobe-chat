'use client';

import { memo } from 'react';

import AutoSaveHintBase from '@/components/Editor/AutoSaveHint';
import { useStore } from '@/features/AgentSetting/store';

/**
 * AutoSaveHint - Save status indicator for agent settings
 */
const AutoSaveHint = memo(() => {
  const saveStatus = useStore((s) => s.saveStatus);
  const lastUpdatedTime = useStore((s) => s.lastUpdatedTime);

  return <AutoSaveHintBase lastUpdatedTime={lastUpdatedTime} saveStatus={saveStatus || 'idle'} />;
});

export default AutoSaveHint;
