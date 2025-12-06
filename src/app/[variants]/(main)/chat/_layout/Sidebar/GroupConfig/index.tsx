'use client';

import { ActionIcon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { Edit, UserPlus } from 'lucide-react';
import { MouseEvent, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ConfigLayout from '@/app/[variants]/(mobile)/chat/topic/features/ConfigLayout';
import SidebarHeader from '@/components/SidebarHeader';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/slices/session/selectors';
import type { LobeGroupSession } from '@/types/session';

import GroupMember from './GroupMember';
import GroupRole from './GroupRole';
import Header from './Header';

const GroupChatSidebar = memo(() => {
  const theme = useTheme();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const { t } = useTranslation(['chat', 'common']);
  const [sessionId, currentSession, members] = useSessionStore((s) => {
    const session = sessionSelectors.currentSession(s);
    return [
      s.activeId,
      session?.type === 'group' ? (session as LobeGroupSession) : undefined,
      session?.type === 'group' ? session.members?.length : undefined,
    ];
  }, isEqual);

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
    <>
      <ConfigLayout
        actions={
          <ActionIcon
            icon={Edit}
            onClick={handleOpenWithEdit}
            size={'small'}
            title={t('edit', { ns: 'common' })}
          />
        }
        expandedHeight={200}
        sessionId={sessionId}
        title={<Header />}
      >
        <GroupRole
          currentSession={currentSession}
          editing={editing}
          editorModalOpen={editorModalOpen}
          setEditing={setEditing}
          setEditorModalOpen={setEditorModalOpen}
        />
      </ConfigLayout>
      <Flexbox style={{ borderTop: `1px solid ${theme.colorBorderSecondary}`, maxHeight: 320 }}>
        <SidebarHeader
          actions={
            <ActionIcon
              icon={UserPlus}
              onClick={handleAddMember}
              size={'small'}
              title={t('groupSidebar.members.addMember')}
            />
          }
          title={[t('groupSidebar.tabs.members'), Number(members) + 1].join(' ')}
        />
        <Flexbox style={{ overflowY: 'auto' }}>
          <GroupMember
            addModalOpen={addModalOpen}
            currentSession={currentSession}
            onAddModalOpenChange={setAddModalOpen}
            sessionId={sessionId}
          />
        </Flexbox>
      </Flexbox>
    </>
  );
});

export default GroupChatSidebar;
