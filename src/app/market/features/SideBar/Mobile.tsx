import { Modal } from '@lobehub/ui';
import { PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { agentMarketSelectors, useMarketStore } from '@/store/market';

const Mobile = memo<PropsWithChildren>(({ children }) => {
  const [showAgentSidebar, deactivateAgent] = useMarketStore((s) => [
    agentMarketSelectors.showSideBar(s),
    s.deactivateAgent,
  ]);

  const { t } = useTranslation('market');

  return (
    <Modal onCancel={deactivateAgent} open={showAgentSidebar} title={t('sidebar.title')}>
      {children}
    </Modal>
  );
});

export default Mobile;
