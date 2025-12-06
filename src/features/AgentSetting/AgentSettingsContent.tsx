import { ReactNode, memo } from 'react';

import { useStore } from '@/features/AgentSetting/store';
import { ChatSettingsTabs } from '@/store/global/initialState';

import AgentChat from './AgentChat';
import AgentModal from './AgentModal';
import AgentOpening from './AgentOpening';

export interface AgentSettingsContentProps {
  loadingSkeleton: ReactNode;
  tab: ChatSettingsTabs;
}

const AgentSettingsContent = memo<AgentSettingsContentProps>(({ tab, loadingSkeleton }) => {
  const loading = useStore((s) => s.loading);

  if (loading) return loadingSkeleton;

  return (
    <>
      {tab === ChatSettingsTabs.Opening && <AgentOpening />}
      {tab === ChatSettingsTabs.Chat && <AgentChat />}
      {tab === ChatSettingsTabs.Modal && <AgentModal />}
    </>
  );
});

export default AgentSettingsContent;
