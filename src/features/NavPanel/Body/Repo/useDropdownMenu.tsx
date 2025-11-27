import { type MenuProps } from '@lobehub/ui';
import { useMemo } from 'react';

import { useRepoMenuItems } from '@/features/NavPanel/hooks';

export const useRepoActionsDropdownMenu = (): MenuProps['items'] => {
  const { createRepoMenuItem } = useRepoMenuItems();

  return useMemo(() => {
    return [createRepoMenuItem()].filter(Boolean) as MenuProps['items'];
  }, [createRepoMenuItem]);
};
