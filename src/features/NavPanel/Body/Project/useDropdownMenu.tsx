import { type MenuProps } from '@lobehub/ui';
import { useMemo } from 'react';

import { useProjectMenuItems } from '@/features/NavPanel/hooks';

export const useProjectActionsDropdownMenu = (): MenuProps['items'] => {
  const { createProjectMenuItem } = useProjectMenuItems();

  return useMemo(() => {
    return [createProjectMenuItem()].filter(Boolean) as MenuProps['items'];
  }, [createProjectMenuItem]);
};
