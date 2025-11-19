'use client';

import React, { memo, useState } from 'react';

import { useFetchSessions } from '@/hooks/useFetchSessions';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import ConfigGroupModal from '../Modals/ConfigGroupModal';
import RenameGroupModal from '../Modals/RenameGroupModal';
import SkeletonList from '../SkeletonList';
import Group from './Group';
import SessionList from './List';
import { useAgentList } from './useAgentList';

const AgentList = memo(() => {
  const isInit = useSessionStore(sessionSelectors.isSessionListInit);
  const { customList, pinnedList, defaultList } = useAgentList();
  const [activeGroupId, setActiveGroupId] = useState<string>();
  const [renameGroupModalOpen, setRenameGroupModalOpen] = useState(false);
  const [configGroupModalOpen, setConfigGroupModalOpen] = useState(false);

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
          setActiveGroupId={setActiveGroupId}
          setConfigGroupModalOpen={setConfigGroupModalOpen}
          setRenameGroupModalOpen={setRenameGroupModalOpen}
        />
      )}
      {showDefault && <SessionList dataSource={defaultList || []} />}
      {activeGroupId && (
        <RenameGroupModal
          id={activeGroupId}
          onCancel={() => setRenameGroupModalOpen(false)}
          open={renameGroupModalOpen}
        />
      )}
      <ConfigGroupModal
        onCancel={() => setConfigGroupModalOpen(false)}
        open={configGroupModalOpen}
      />
    </>
  );
});

export default AgentList;
