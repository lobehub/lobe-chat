'use client';

import { memo, useMemo } from 'react';

import { useFetchSessions } from '@/hooks/useFetchSessions';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import SkeletonList from '../../SkeletonList';
import Group from './Group';
import SessionList from './List';
import { useAgentList } from './useAgentList';

const AgentList = memo(() => {
  const isInit = useSessionStore(sessionSelectors.isSessionListInit);
  const { customList, pinnedList, defaultList } = useAgentList();

  useFetchSessions();

  // Memoize computed visibility flags to prevent unnecessary recalculations
  const { showPinned, showCustom, showDefault } = useMemo(() => {
    const hasPinned = Boolean(pinnedList?.length);
    const hasCustom = Boolean(customList?.length);
    const hasDefault = Boolean(defaultList?.length);

    return {
      showCustom: hasCustom,
      showDefault: hasDefault,
      showPinned: hasPinned,
    };
  }, [pinnedList?.length, customList?.length, defaultList?.length]);

  if (!isInit) return <SkeletonList />;

  return (
    <>
      {showPinned && <SessionList dataSource={pinnedList!} />}
      {showCustom && <Group dataSource={customList!} />}
      {showDefault && <SessionList dataSource={defaultList!} />}
    </>
  );
});

export default AgentList;
