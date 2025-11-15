import { DiscoverTab } from '@/types/discover';

import { useQueryState } from './useQueryParam';

export const useDiscoverTab = () => {
  const [type] = useQueryState('type', {
    clearOnDefault: true,
    defaultValue: DiscoverTab.Assistants,
  });

  return type as DiscoverTab;
};
