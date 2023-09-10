import { Modal } from 'antd';
import { useResponsive } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { MAX_WIDTH } from '@/const/layoutTokens';
import { useMarketStore } from '@/store/market';

import Inner from './Inner';

const AgentModal = memo(() => {
  const [agentModalOpen, agentManifest] = useMarketStore((s) => [
    s.agentModalOpen,
    s.agentManifest,
  ]);
  const { t } = useTranslation('market');
  const { mobile } = useResponsive();

  const handleClose = () => {
    useMarketStore.setState({ agentModalOpen: false });
  };

  const handleAddAgent = () => {
    // TODO: 添加助手逻辑
    console.log(agentManifest);
    handleClose();
  };

  return (
    <Modal
      afterClose={() =>
        useMarketStore.setState({ agentManifest: undefined, agentManifestUrl: undefined })
      }
      cancelText={t('cancel', { ns: 'common' })}
      closeIcon={mobile}
      destroyOnClose
      maskStyle={{ backdropFilter: 'blur(2px)' }}
      okText={t('addAgent')}
      onCancel={handleAddAgent}
      onOk={handleClose}
      open={agentModalOpen}
      width={mobile ? undefined : MAX_WIDTH}
    >
      <Inner />
    </Modal>
  );
});

export default AgentModal;
