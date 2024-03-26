import { usePathname } from 'next/navigation';

import { SettingsTabs } from '@/store/global/initialState';

/**
 * Returns the active setting page key (common/sync/agent/...)
 */
export const useActiveSettingsKey = () => {
  const pathname = usePathname();

  return pathname.split('/').at(-1) as SettingsTabs;
};
