import { useQueryState } from 'nuqs';

import { DiscoverTab } from '@/types/discover';

export const useDiscoverTab = () => {
  const [type] = useQueryState('type', {
    clearOnDefault: true,
    defaultValue: DiscoverTab.Assistants,
  });

  return type as DiscoverTab;
};
