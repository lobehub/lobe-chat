import { Modal } from '@lobehub/ui';
import { Button, FormInstance } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';
import { useAiInfraStore } from '@/store/aiInfra';

import ModelConfigForm from './Form';

interface ModelConfigModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ModelConfigModal = memo<ModelConfigModalProps>(({ open, setOpen }) => {
  const { t } = useTranslation(['modelProvider', 'common']);
  const [formInstance, setFormInstance] = useState<FormInstance>();
  const [loading, setLoading] = useState(false);
  const [editingProvider, createNewAiModel] = useAiInfraStore((s) => [
    s.activeAiProvider!,
    s.createNewAiModel,
  ]);

  const closeModal = () => {
    setOpen(false);
  };

  return (
    <Modal
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={closeModal}>
          {t('cancel', { ns: 'common' })}
        </Button>,

        <Button
          key="ok"
          loading={loading}
          onClick={async () => {
            if (!editingProvider || !formInstance) return;
            const data = formInstance.getFieldsValue();

            setLoading(true);

            try {
              await formInstance.validateFields();
              await createNewAiModel({ ...data, providerId: editingProvider });
              setLoading(false);
              closeModal();
            } catch {
              /*  */
              setLoading(false);
            }
          }}
          style={{ marginInlineStart: '16px' }}
          type="primary"
        >
          {t('ok', { ns: 'common' })}
        </Button>,
      ]}
      maskClosable
      onCancel={closeModal}
      open={open}
      title={t('providerModels.createNew.title')}
      zIndex={1251} // Select is 1150
    >
      <ModelConfigForm
        onFormInstanceReady={setFormInstance}
        showAzureDeployName={editingProvider === ModelProvider.Azure}
      />
    </Modal>
  );
});
export default ModelConfigModal;
