import { EditableText } from '@lobehub/ui';
import { memo, useCallback } from 'react';

import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

interface EditingProps {
  id: string;
  name: string;
  toggleEditing: (visible?: boolean) => void;
}

const Editing = memo<EditingProps>(({ id, name, toggleEditing }) => {
  const [editing, updateKnowledgeBase] = useKnowledgeBaseStore((s) => [
    s.knowledgeBaseRenamingId === id,
    s.updateKnowledgeBase,
  ]);

  const handleChangeEnd = useCallback(
    (v: string) => {
      if (name !== v) {
        updateKnowledgeBase(id, { name: v });
      }
      toggleEditing(false);
    },
    [name, id, updateKnowledgeBase, toggleEditing],
  );

  if (!editing) return null;

  return (
    <EditableText
      editing={editing}
      inputProps={{
        autoFocus: true,
        maxLength: 64,
      }}
      onChangeEnd={handleChangeEnd}
      onClick={(e) => {
        e.preventDefault();
      }}
      onEditingChange={toggleEditing}
      showEditIcon={false}
      style={{ height: 28 }}
      value={name}
    />
  );
});

export default Editing;
