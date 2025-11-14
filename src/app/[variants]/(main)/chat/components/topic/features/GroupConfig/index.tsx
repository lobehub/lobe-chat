'use client';

import { ActionIcon, Tabs } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { Edit, UserPlus } from 'lucide-react';
import { MouseEvent, memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatGroupStore } from '@/store/chatGroup';
import { chatGroupSelectors } from '@/store/chatGroup/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/slices/session/selectors';
import type { LobeGroupSession } from '@/types/session';

import ConfigLayout from '../ConfigLayout';
import GroupMember from './GroupMember';
import GroupRole from './GroupRole';

const GroupChatSidebar = memo(() => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('members');
  const { t } = useTranslation(['chat', 'common']);

  const [sessionId] = useSessionStore((s) => [s.activeId]);
  const currentSession = useSessionStore((state) => {
    const session = sessionSelectors.currentSession(state);
    return session?.type === 'group' ? (session as LobeGroupSession) : undefined;
  }, isEqual);

  const groupConfig = useChatGroupStore(chatGroupSelectors.getGroupConfig(sessionId || ''));

  // Switch to members tab if host tab becomes unavailable
  useEffect(() => {
    if (activeTab === 'host' && !groupConfig?.enableSupervisor) {
      setActiveTab('members');
    }
  }, [activeTab, groupConfig?.enableSupervisor]);

  const handleAddMember = (e: MouseEvent) => {
    e.stopPropagation();
    setAddModalOpen(true);
  };

  const handleOpenWithEdit = (e: MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
    setEditorModalOpen(true);
  };

  const actions =
    activeTab === 'members' ? (
      <ActionIcon
        icon={UserPlus}
        onClick={handleAddMember}
        size={'small'}
        title={t('groupSidebar.members.addMember')}
      />
    ) : activeTab === 'host' ? (
      <ActionIcon
        icon={Edit}
        onClick={handleOpenWithEdit}
        size={'small'}
        title={t('edit', { ns: 'common' })}
      />
    ) : undefined;

  return (
    <ConfigLayout
      actions={actions}
      expandedHeight={activeTab === 'members' ? '40vh' : 200}
      headerStyle={{ paddingBlock: 0, paddingLeft: 0 }}
      sessionId={sessionId}
      title={
        <Tabs
          activeKey={activeTab}
          compact
          items={[
            {
              key: 'members',
              label: t('groupSidebar.tabs.members'),
            },
            // Only show host tab if supervisor is enabled
            ...(groupConfig?.enableSupervisor
              ? [
                  {
                    key: 'host',
                    label: t('groupSidebar.tabs.host'),
                  },
                ]
              : []),
          ]}
          onChange={(key) => setActiveTab(key)}
          onClick={(e) => {
            e.stopPropagation();
          }}
          size="small"
          variant="rounded"
        />
      }
    >
      {activeTab === 'members' && (
        <GroupMember
          addModalOpen={addModalOpen}
          currentSession={currentSession}
          onAddModalOpenChange={setAddModalOpen}
          sessionId={sessionId}
        />
      )}
      {activeTab === 'host' && (
        <GroupRole
          currentSession={currentSession}
          editing={editing}
          editorModalOpen={editorModalOpen}
          setEditing={setEditing}
          setEditorModalOpen={setEditorModalOpen}
        />
      )}
    </ConfigLayout>
  );
});

export default GroupChatSidebar;
