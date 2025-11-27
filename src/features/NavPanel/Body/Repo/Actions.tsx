import { ActionIcon } from '@lobehub/ui';
import { PlusIcon } from 'lucide-react';
import { memo } from 'react';

import { useRepoMenuItems } from '@/features/NavPanel/hooks';

const Actions = memo(() => {
  const { createRepo } = useRepoMenuItems();

  return <ActionIcon icon={PlusIcon} onClick={createRepo} size={'small'} />;
});

export default Actions;
