import { Avatar, Block, EmojiPicker, Input } from '@lobehub/ui';
import { Popover } from 'antd';
import { useThemeMode } from 'antd-style';
import { memo, useCallback, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';
import { LobeAgentSession, LobeSessionType } from '@/types/session';

interface EditingProps {
  id: string;
  title: string;
  toggleEditing: (visible?: boolean) => void;
}

const Editing = memo<EditingProps>(({ id, title, toggleEditing }) => {
  const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);
  const { isDarkMode } = useThemeMode();

  const [editing, session] = useSessionStore((s) => {
    const sess = sessionSelectors.getSessionById(id)(s);
    return [s.sessionRenamingId === id, sess];
  });

  const currentAvatar = sessionMetaSelectors.getAvatar(session.meta);

  const [newTitle, setNewTitle] = useState(title);
  const [newAvatar, setNewAvatar] = useState(currentAvatar);

  const handleUpdate = useCallback(async () => {
    const hasChanges =
      (newTitle && title !== newTitle) || (newAvatar && currentAvatar !== newAvatar);

    if (hasChanges) {
      try {
        // Set loading state
        useSessionStore.setState({ sessionUpdatingId: id }, false, 'setSessionUpdating');

        const updates: { avatar?: string; title?: string } = {};
        if (newTitle && title !== newTitle) updates.title = newTitle;
        if (newAvatar && currentAvatar !== newAvatar) updates.avatar = newAvatar;

        // Get the agentId from the session's config
        // For agent sessions, session.config.id is the agentId
        // internal_updateAgentMeta expects agentId directly
        const targetId =
          session.type === LobeSessionType.Agent
            ? ((session as LobeAgentSession).config.id ?? id)
            : id;

        // Use internal_updateAgentMeta to update the specific agent's meta
        await useAgentStore.getState().internal_updateAgentMeta(targetId, updates);
      } finally {
        // Clear loading state
        useSessionStore.setState({ sessionUpdatingId: null }, false, 'clearSessionUpdating');
      }
    }
    toggleEditing(false);
  }, [newTitle, newAvatar, title, currentAvatar, id, session]);

  return (
    <Popover
      arrow={false}
      content={
        <Flexbox gap={4} horizontal onClick={(e) => e.stopPropagation()} style={{ width: 320 }}>
          <EmojiPicker
            customRender={(avatar) => (
              <Block
                align={'center'}
                clickable
                height={36}
                justify={'center'}
                onClick={(e) => e.stopPropagation()}
                variant={isDarkMode ? 'filled' : 'outlined'}
                width={36}
              >
                <Avatar avatar={avatar} shape={'square'} size={32} />
              </Block>
            )}
            locale={locale}
            onChange={setNewAvatar}
            shape={'square'}
            value={newAvatar}
          />
          <Input
            autoFocus
            defaultValue={title}
            onChange={(e) => setNewTitle(e.target.value)}
            onPressEnter={() => {
              handleUpdate();
              toggleEditing(false);
            }}
            style={{ flex: 1 }}
          />
        </Flexbox>
      }
      destroyOnHidden
      onOpenChange={(open) => {
        if (!open) handleUpdate();
        toggleEditing(open);
      }}
      open={editing}
      placement={'bottomLeft'}
      styles={{
        body: {
          padding: 4,
        },
      }}
      trigger={['click']}
    >
      <div />
    </Popover>
  );
});

export default Editing;
