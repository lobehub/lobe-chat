import { usePathname } from 'next/navigation';

import { useQuery } from '@/hooks/useQuery';
import { SettingsTabs } from '@/store/global/initialState';

/**
 * Returns the active setting page key (common/sync/agent/...)
 */
export const useActiveSettingsKey = () => {
  const pathname = usePathname();
  const { tab } = useQuery();

  const tabs = pathname.split('/').at(-1);

  if (tabs === 'settings') return SettingsTabs.Common;

  if (tabs === 'modal') return tab as SettingsTabs;

  return tabs as SettingsTabs;
};
