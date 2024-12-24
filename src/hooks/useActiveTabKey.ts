import { usePathname } from 'next/navigation';

import { useQuery } from '@/hooks/useQuery';
import { ProfileTabs, SettingsTabs, SidebarTabKey } from '@/store/global/initialState';

/**
 * Returns the active tab key (chat/market/settings/...)
 */
export const useActiveTabKey = () => {
  const pathname = usePathname();

  return pathname.split('/').find(Boolean)! as SidebarTabKey;
};

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

/**
 * Returns the active profile page key (profile/security/stats/...)
 */
export const useActiveProfileKey = () => {
  const pathname = usePathname();
  const { tab } = useQuery();

  const tabs = pathname.split('/').at(-1);

  if (tabs === 'profile') return ProfileTabs.Profile;

  if (tabs === 'modal') return tab as ProfileTabs;

  return tabs as ProfileTabs;
};
