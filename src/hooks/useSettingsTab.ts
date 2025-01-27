import { useQueryState } from 'nuqs';

import { SettingsTabs } from '@/store/global/initialState';

export const useSettingsTab = () => {
  const [type] = useQueryState('tab', {
    clearOnDefault: true,
    defaultValue: SettingsTabs.Common,
  });

  return type as SettingsTabs;
};
