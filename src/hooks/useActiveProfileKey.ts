import { usePathname } from 'next/navigation';

import { useQuery } from '@/hooks/useQuery';
import { ProfileTabs } from '@/store/global/initialState';

export const useActiveProfileKey = () => {
  const pathname = usePathname();
  const { tab } = useQuery();

  const tabs = pathname.split('/').at(-1);

  if (tabs === 'profile') return ProfileTabs.Profile;

  if (tabs === 'modal') return tab as ProfileTabs;

  return tabs as ProfileTabs;
};
