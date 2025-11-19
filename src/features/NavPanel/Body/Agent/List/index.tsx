'use client';

import React, { memo } from 'react';

import { useFetchSessions } from '@/hooks/useFetchSessions';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import { useAgentModal } from '../ModalProvider';
import SkeletonList from '../SkeletonList';
import Group from './Group';
import SessionList from './List';
import { useAgentList } from './useAgentList';

const AgentList = memo(() => {
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const isInit = useSessionStore(sessionSelectors.isSessionListInit);
  const { customList, pinnedList, defaultList } = useAgentList();
  const { openRenameGroupModal, openConfigGroupModal } = useAgentModal();

  useFetchSessions();

  if (!isInit) return <SkeletonList />;

  const showPinned = pinnedList && pinnedList.length > 0;
  const showCustom = customList && customList.length > 0;
  const showDefault = defaultList && defaultList.length > 0;

  const hideGroup = !expand && showPinned;

  return (
    <>
      {showPinned && <SessionList dataSource={pinnedList} />}
      {!hideGroup && showCustom && (
        <Group
          dataSource={customList}
          openConfigGroupModal={openConfigGroupModal}
          openRenameGroupModal={openRenameGroupModal}
        />
      )}
      {!hideGroup && showDefault && <SessionList dataSource={defaultList || []} />}
    </>
  );
});

export default AgentList;
