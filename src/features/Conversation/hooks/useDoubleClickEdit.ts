import { MouseEventHandler, useCallback } from 'react';

import { useConversationStore, virtuaListSelectors } from '../store';

interface UseDoubleClickEditProps {
  disableEditing?: boolean;
  error: any;
  id: string;
  index: number;
  role: string;
}

export const useDoubleClickEdit = ({
  disableEditing,
  role,
  error,
  id,
  index,
}: UseDoubleClickEditProps) => {
  const toggleMessageEditing = useConversationStore((s) => s.toggleMessageEditing);
  const virtuaScrollMethods = useConversationStore(virtuaListSelectors.virtuaScrollMethods);

  return useCallback<MouseEventHandler<HTMLDivElement>>(
    (e) => {
      if (
        disableEditing ||
        error ||
        id === 'default' ||
        !e.altKey ||
        !['assistant', 'user'].includes(role)
      )
        return;

      toggleMessageEditing(id, true);

      virtuaScrollMethods?.scrollToIndex(index, { align: 'start' });
    },
    [role, disableEditing, toggleMessageEditing, virtuaScrollMethods, id, index],
  );
};
