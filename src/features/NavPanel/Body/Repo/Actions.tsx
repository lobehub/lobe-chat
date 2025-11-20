import { memo } from 'react';

import { useRepoMenuItems } from '@/features/NavPanel/hooks';

const Actions = memo(() => {
  const { createKnowledgeBaseButton } = useRepoMenuItems();

  return createKnowledgeBaseButton();
});

export default Actions;
