import { usePathname } from 'next/navigation';

import { SettingsTabs } from '@/store/user/initialState';

/**
 * Returns the active setting page key (common/sync/agent/...)
 */
export const useActiveSettingsKey = () => {
  const pathname = usePathname();

  const tabs = pathname.split('/').at(-1);

  if (tabs === 'settings') return SettingsTabs.Common;

  return tabs as SettingsTabs;
};
