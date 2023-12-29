import { Modal } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { agentMarketSelectors, useMarketStore } from '@/store/market';

import AgentDetailContent from '../../features/AgentDetailContent';

const AgentDetail = memo(() => {
  const [showAgentSidebar, deactivateAgent] = useMarketStore((s) => [
    agentMarketSelectors.showSideBar(s),
    s.deactivateAgent,
  ]);

  const { t } = useTranslation('market');

  return (
    <Modal
      allowFullscreen
      onCancel={deactivateAgent}
      open={showAgentSidebar}
      styles={{ body: { padding: 0 } }}
      title={t('sidebar.title')}
    >
      <AgentDetailContent />
    </Modal>
  );
});

export default AgentDetail;
