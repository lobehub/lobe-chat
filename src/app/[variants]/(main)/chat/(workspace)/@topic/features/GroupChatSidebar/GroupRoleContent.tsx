'use client';

import { EditableMessage } from '@lobehub/ui/chat';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import GroupInfo from '@/features/GroupInfo';
import { useChatGroupStore } from '@/store/chatGroup';
import { chatGroupSelectors } from '@/store/chatGroup/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { LobeGroupSession } from '@/types/session';

import { useStyles } from './style';

interface GroupRoleContentProps {
  currentSession: LobeGroupSession;
}

const GroupRoleContent = memo<GroupRoleContentProps>(({ currentSession }) => {
  const { styles } = useStyles();
  const [systemPromptEditing, setSystemPromptEditing] = useState(false);
  const [systemPromptModalOpen, setSystemPromptModalOpen] = useState(false);
  const { t } = useTranslation('chat');

  const activeGroupId = useSessionStore((s) => s.activeId);
  const updateGroupConfig = useChatGroupStore((s) => s.updateGroupConfig);
  const groupConfig = useChatGroupStore(chatGroupSelectors.currentGroupConfig);

  const handleSystemPromptChange = async (value: string) => {
    if (!activeGroupId) return;
    await updateGroupConfig({ systemPrompt: value });
  };

  return (
    <Flexbox gap={0} style={{ padding: '16px' }}>
      <div
        onClick={() => setSystemPromptModalOpen(true)}
        style={{ cursor: 'pointer' }}
      >
        <EditableMessage
          classNames={{ markdown: styles.prompt }}
          editing={systemPromptEditing}
          markdownProps={{ enableLatex: false, enableMermaid: false }}
          model={{
            extra: (
              <GroupInfo
                meta={currentSession?.meta}
                style={{ marginBottom: 16 }}
                systemPrompt={groupConfig?.systemPrompt}
              />
            ),
          }}
          onChange={handleSystemPromptChange}
          onEditingChange={setSystemPromptEditing}
          onOpenChange={setSystemPromptModalOpen}
          openModal={systemPromptModalOpen}
          placeholder={`${t('settingAgent.prompt.placeholder', { ns: 'setting' })}...`}
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
            title: 'Group System Role',
          }}
          value={groupConfig?.systemPrompt || ''}
        />
      </div>
    </Flexbox>
  );
});

export default GroupRoleContent;
