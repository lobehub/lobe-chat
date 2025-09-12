import { Skeleton } from 'antd';
import { Suspense, memo } from 'react';

import { GroupSettingsTabs } from '@/store/global/initialState';
import { useServerConfigStore } from '@/store/serverConfig';

import { GroupChatSettingsProvider } from './GroupChatSettingsProvider';
import GroupSettingsContent from './GroupSettingsContent';
import { StoreUpdaterProps } from './StoreUpdater';

export interface GroupSettingsProps extends StoreUpdaterProps {
  tab?: GroupSettingsTabs;
}

const GroupSettings = memo<GroupSettingsProps>(({ tab = GroupSettingsTabs.Settings, ...rest }) => {
  const isMobile = useServerConfigStore((s) => s.isMobile);
  const loadingSkeleton = (
    <Skeleton active paragraph={{ rows: 6 }} style={{ padding: isMobile ? 16 : 0 }} title={false} />
  );

  return (
    <GroupChatSettingsProvider {...rest}>
      <Suspense fallback={loadingSkeleton}>
        <GroupSettingsContent loadingSkeleton={loadingSkeleton} tab={tab} />
      </Suspense>
    </GroupChatSettingsProvider>
  );
});

export default GroupSettings;
