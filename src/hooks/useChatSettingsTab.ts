import { useQueryState } from 'nuqs';

import { ChatSettingsTabs } from '@/store/global/initialState';

export const useChatSettingsTab = () => {
  const [type] = useQueryState('tab', {
    clearOnDefault: true,
    defaultValue: ChatSettingsTabs.Meta,
  });

  return type as ChatSettingsTabs;
};
