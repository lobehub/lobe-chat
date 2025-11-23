import { MouseEventHandler, use, useCallback } from 'react';

import { useChatStore } from '@/store/chat';

import { VirtuaContext } from '../components/VirtualizedList/VirtuosoContext';

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
  const [toggleMessageEditing] = useChatStore((s) => [s.toggleMessageEditing]);
  const virtuaRef = use(VirtuaContext);

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

      virtuaRef?.current?.scrollToIndex(index, { align: 'start' });
    },
    [role, disableEditing],
  );
};
