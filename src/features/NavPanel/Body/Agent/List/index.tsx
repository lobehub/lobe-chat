'use client';

import React, { memo } from 'react';

import { useFetchSessions } from '@/hooks/useFetchSessions';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import { useAgentModal } from '../ModalProvider';
import SkeletonList from '../SkeletonList';
import Group from './Group';
import SessionList from './List';
import { useAgentList } from './useAgentList';

const AgentList = memo(() => {
  const isInit = useSessionStore(sessionSelectors.isSessionListInit);
  const { customList, pinnedList, defaultList } = useAgentList();
  const { openRenameGroupModal, openConfigGroupModal } = useAgentModal();

  useFetchSessions();

  if (!isInit) return <SkeletonList />;

  const showPinned = pinnedList && pinnedList.length > 0;
  const showCustom = customList && customList.length > 0;
  const showDefault = defaultList && defaultList.length > 0;

  return (
    <>
      {showPinned && <SessionList dataSource={pinnedList} />}
      {showCustom && (
        <Group
          dataSource={customList}
          openConfigGroupModal={openConfigGroupModal}
          openRenameGroupModal={openRenameGroupModal}
        />
      )}
      {showDefault && <SessionList dataSource={defaultList || []} />}
    </>
  );
});

export default AgentList;
