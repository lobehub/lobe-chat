'use client';

import { ActionIcon, Tabs } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { Edit, UserPlus } from 'lucide-react';
import { MouseEvent, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/slices/session/selectors';

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
  const currentSession = useSessionStore(sessionSelectors.currentSession, isEqual);

  const handleAddMember = (e: MouseEvent) => {
    e.stopPropagation();
    setAddModalOpen(true);
  };

  const handleOpenWithEdit = (e: MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
    setEditorModalOpen(true);
  };

  return (
    <ConfigLayout
      actions={
        activeTab === 'members' ? (
          <ActionIcon
            icon={UserPlus}
            onClick={handleAddMember}
            size={'small'}
            title={t('groupSidebar.members.addMember')}
          />
        ) : (
          <ActionIcon
            icon={Edit}
            onClick={handleOpenWithEdit}
            size={'small'}
            title={t('edit', { ns: 'common' })}
          />
        )
      }
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
            {
              key: 'role',
              label: t('groupSidebar.tabs.role'),
            },
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
      {activeTab === 'role' && (
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
