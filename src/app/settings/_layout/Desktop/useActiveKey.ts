import { usePathname } from 'next/navigation';

import { SettingsTabs } from '@/store/global/initialState';

export const useActiveKey = () => {
  const pathname = usePathname();

  return pathname.split('/').at(-1) as SettingsTabs;
};
