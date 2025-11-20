import { Input } from '@lobehub/ui';
import { Popover } from 'antd';
import { memo, useCallback, useState } from 'react';

import { useSessionStore } from '@/store/session';

interface EditingProps {
  id: string;
  name: string;
  toggleEditing: (visible?: boolean) => void;
}

const Editing = memo<EditingProps>(({ id, name, toggleEditing }) => {
  const [newName, setNewName] = useState(name);
  const [editing, updateSessionGroupName] = useSessionStore((s) => [
    s.sessionGroupRenamingId === id,
    s.updateSessionGroupName,
  ]);

  const handleUpdate = useCallback(() => {
    if (newName && name !== newName) {
      updateSessionGroupName(id, newName);
    }
    toggleEditing(false);
  }, [newName, name, id, updateSessionGroupName, toggleEditing]);

  return (
    <Popover
      arrow={false}
      content={
        <Input
          autoFocus
          defaultValue={name}
          onBlur={() => {
            handleUpdate();
            toggleEditing(false);
          }}
          onChange={(e) => setNewName(e.target.value)}
          onPressEnter={() => {
            handleUpdate();
            toggleEditing(false);
          }}
        />
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
          width: 320,
        },
      }}
      trigger={['click']}
    />
  );
});

export default Editing;
