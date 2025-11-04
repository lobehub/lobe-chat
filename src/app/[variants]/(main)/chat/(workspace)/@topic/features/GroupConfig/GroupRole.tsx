'use client';

import { EditableMessage } from '@lobehub/ui/chat';
import { MouseEvent, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import GroupInfo from '@/features/GroupInfo';
import { useChatGroupStore } from '@/store/chatGroup';
import { chatGroupSelectors } from '@/store/chatGroup/selectors';
import { useSessionStore } from '@/store/session';
import { LobeSession } from '@/types/session';

import { useStyles } from './style';

interface GroupRoleProps {
  currentSession?: LobeSession;
  editing: boolean;
  editorModalOpen: boolean;
  setEditing: (editing: boolean) => void;
  setEditorModalOpen: (open: boolean) => void;
}

const GroupRole = memo<GroupRoleProps>(
  ({ currentSession, editorModalOpen, setEditorModalOpen, setEditing, editing }) => {
    const { styles } = useStyles();
    const { t } = useTranslation('chat');

    const activeGroupId = useSessionStore((s) => s.activeId);
    const updateGroupConfig = useChatGroupStore((s) => s.updateGroupConfig);
    const groupConfig = useChatGroupStore(chatGroupSelectors.currentGroupConfig);

    const handleSystemPromptChange = async (value: string) => {
      if (!activeGroupId) return;
      await updateGroupConfig({ systemPrompt: value });
    };

    const handleOpenWithEdit = (e: MouseEvent) => {
      e.stopPropagation();
      setEditing(true);
      setEditorModalOpen(true);
    };

    const handleOpen = (e: MouseEvent) => {
      e.stopPropagation();
      if (editorModalOpen) return;
      if (e.altKey) handleOpenWithEdit(e);
      setEditorModalOpen(true);
    };

    return (
      <Flexbox height={200} onClick={handleOpen} padding={16}>
        <EditableMessage
          classNames={{ markdown: styles.prompt }}
          editing={editing}
          markdownProps={{ enableLatex: false, enableMermaid: false }}
          model={{
            extra: <GroupInfo meta={currentSession?.meta} style={{ marginBottom: 16 }} />,
          }}
          onChange={handleSystemPromptChange}
          onEditingChange={setEditing}
          onOpenChange={setEditorModalOpen}
          openModal={editorModalOpen}
          placeholder={`${t('settingGroup.systemPrompt.placeholder', { ns: 'setting' })}...`}
          styles={{
            markdown: {
              opacity: groupConfig?.systemPrompt ? undefined : 0.5,
              overflow: 'visible',
            },
          }}
          text={{
            cancel: t('cancel', { ns: 'common' }),
            confirm: t('ok', { ns: 'common' }),
            edit: t('edit', { ns: 'common' }),
            title: t('settingGroup.systemPrompt.title', { ns: 'setting' }),
          }}
          value={groupConfig?.systemPrompt || ''}
        />
      </Flexbox>
    );
  },
);

GroupRole.displayName = 'GroupRole';

export default GroupRole;
