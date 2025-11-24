import { Icon } from '@lobehub/ui';
import { ItemType } from 'antd/es/menu/interface';
import { BoxIcon } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useCreateNewModal } from '@/features/KnowledgeBaseModal';

/**
 * Hook for generating menu items/buttons for knowledge base actions
 * Used in Body/Repo/Actions.tsx
 */
export const useRepoMenuItems = () => {
  const { t } = useTranslation('knowledgeBase');
  const navigate = useNavigate();
  const { open } = useCreateNewModal();

  /**
   * Create knowledge base action
   */
  const createRepo = useCallback(() => {
    open({
      onSuccess: (id) => {
        navigate(`/knowledge/bases/${id}`);
      },
    });
  }, [open, navigate]);

  const createRepoMenuItem = useCallback(
    (): ItemType => ({
      icon: <Icon icon={BoxIcon} />,
      key: 'createRepo',
      label: t('createNew.title'),
      onClick: (info) => {
        info.domEvent?.stopPropagation();
        createRepo();
      },
    }),
    [t, createRepo],
  );

  return {
    createRepo,
    createRepoMenuItem,
  };
};
