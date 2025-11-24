import { Avatar, Block, EmojiPicker, Input } from '@lobehub/ui';
import { Popover } from 'antd';
import { memo, useCallback, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';

interface EditingProps {
  id: string;
  title: string;
  toggleEditing: (visible?: boolean) => void;
}

const Editing = memo<EditingProps>(({ id, title, toggleEditing }) => {
  const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);

  const [editing, updateSessionMeta, switchSession, session] = useSessionStore((s) => {
    const sess = sessionSelectors.getSessionById(id)(s);
    return [s.sessionRenamingId === id, s.updateSessionMeta, s.switchSession, sess];
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

        // Switch to this session first to ensure updateSessionMeta works on the correct session
        switchSession(id);
        const updates: { avatar?: string; title?: string } = {};
        if (newTitle && title !== newTitle) updates.title = newTitle;
        if (newAvatar && currentAvatar !== newAvatar) updates.avatar = newAvatar;
        await updateSessionMeta(updates);
      } finally {
        // Clear loading state
        useSessionStore.setState({ sessionUpdatingId: null }, false, 'clearSessionUpdating');
      }
    }
    toggleEditing(false);
  }, [newTitle, newAvatar, title, currentAvatar, id, updateSessionMeta, switchSession]);

  return (
    <Popover
      arrow={false}
      content={
        <Flexbox gap={4} horizontal style={{ width: 320 }}>
          <EmojiPicker
            customRender={(avatar) => (
              <Block
                align={'center'}
                clickable
                height={36}
                justify={'center'}
                variant={'outlined'}
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
            onBlur={() => {
              handleUpdate();
              toggleEditing(false);
            }}
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
    />
  );
});

export default Editing;
