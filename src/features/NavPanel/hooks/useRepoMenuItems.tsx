import { ActionIcon } from '@lobehub/ui';
import { PlusIcon } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCreateNewModal } from '@/features/KnowledgeBaseModal';

/**
 * Hook for generating menu items/buttons for knowledge base actions
 * Used in Body/Repo/Actions.tsx
 */
export const useRepoMenuItems = () => {
  const navigate = useNavigate();
  const { open } = useCreateNewModal();

  /**
   * Create knowledge base action
   */
  const createKnowledgeBase = useCallback(() => {
    open({
      onSuccess: (id) => {
        navigate(`/knowledge/bases/${id}`);
      },
    });
  }, [open, navigate]);

  /**
   * Create knowledge base button component
   * Returns an ActionIcon component ready to render
   */
  const createKnowledgeBaseButton = useCallback(
    () => <ActionIcon icon={PlusIcon} onClick={createKnowledgeBase} size={'small'} />,
    [createKnowledgeBase],
  );

  return {
    createKnowledgeBase,
    createKnowledgeBaseButton,
  };
};
