'use client';

import { memo, useMemo } from 'react';

import { useFetchSessions } from '@/hooks/useFetchSessions';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { SessionDefaultGroup } from '@/types/index';

import SkeletonList from '../../../../../../../../features/NavPanel/components/SkeletonList';
import AllAgentsDrawer from '../AllAgentsDrawer';
import Group from './Group';
import SessionList from './List';
import { useAgentList } from './useAgentList';

const AgentList = memo<{ onMoreClick?: () => void }>(({ onMoreClick }) => {
  const isInit = useSessionStore(sessionSelectors.isSessionListInit);
  const { customList, pinnedList, defaultList } = useAgentList();

  const [allAgentsDrawerOpen, closeAllAgentsDrawer] = useSessionStore((s) => [
    s.allAgentsDrawerOpen,
    s.closeAllAgentsDrawer,
  ]);

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

  if (!isInit) return <SkeletonList rows={6} />;

  return (
    <>
      {showPinned && <SessionList dataSource={pinnedList!} />}
      {showCustom && <Group dataSource={customList!} />}
      {showDefault && (
        <SessionList
          dataSource={defaultList!}
          groupId={SessionDefaultGroup.Default}
          onMoreClick={onMoreClick}
        />
      )}
      <AllAgentsDrawer onClose={closeAllAgentsDrawer} open={allAgentsDrawerOpen} />
    </>
  );
});

export default AgentList;
