import { Skeleton } from 'antd';
import { Suspense, memo } from 'react';

import { ChatSettingsTabs } from '@/store/global/initialState';

import AgentSettingsContent from './AgentSettingsContent';
import { AgentSettingsProvider } from './AgentSettingsProvider';
import { StoreUpdaterProps } from './StoreUpdater';

export interface AgentSettingsProps extends StoreUpdaterProps {
  tab: ChatSettingsTabs;
}

const AgentSettings = memo<AgentSettingsProps>(({ tab = ChatSettingsTabs.Meta, ...rest }) => {
  const loadingSkeleton = <Skeleton active paragraph={{ rows: 6 }} title={false} />;

  return (
    <AgentSettingsProvider {...rest}>
      <Suspense fallback={loadingSkeleton}>
        <AgentSettingsContent tab={tab} />
      </Suspense>
    </AgentSettingsProvider>
  );
});

export default AgentSettings;
