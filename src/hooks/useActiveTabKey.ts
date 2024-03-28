import { usePathname } from 'next/navigation';

import { SidebarTabKey } from '@/store/global/initialState';

/**
 * Returns the active tab key (chat/market/settings/...)
 */
export const useActiveTabKey = () => {
  const pathname = usePathname();

  return pathname.split('/').find(Boolean)! as SidebarTabKey;
};
