import { Modal } from '@lobehub/ui';
import { Button, Checkbox, Form, Input } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/store/user';
import { modelConfigSelectors } from '@/store/user/selectors';

import MaxTokenSlider from './MaxTokenSlider';

interface ModelConfigModalProps {
  provider?: string;
  showAzureDeployName?: boolean;
}
const ModelConfigModal = memo<ModelConfigModalProps>(({ showAzureDeployName, provider }) => {
  const [formInstance] = Form.useForm();
  const { t } = useTranslation('setting');
  const { t: tc } = useTranslation('common');

  const [open, id, editingProvider, dispatchCustomModelCards, toggleEditingCustomModelCard] =
    useUserStore((s) => [
      !!s.editingCustomCardModel && provider === s.editingCustomCardModel?.provider,
      s.editingCustomCardModel?.id,
      s.editingCustomCardModel?.provider,
      s.dispatchCustomModelCards,
      s.toggleEditingCustomModelCard,
    ]);

  const modelCard = useUserStore(
    modelConfigSelectors.getCustomModelCard({ id, provider: editingProvider }),
    isEqual,
  );

  const closeModal = () => {
    toggleEditingCustomModelCard(undefined);
  };

  return (
    <Modal
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={closeModal}>
          {tc('cancel')}
        </Button>,

        <Button
          key="ok"
          onClick={() => {
            if (!editingProvider || !id) return;
            const data = formInstance.getFieldsValue();

            dispatchCustomModelCards(editingProvider as any, { id, type: 'update', value: data });

            closeModal();
          }}
          style={{ marginInlineStart: '16px' }}
          type="primary"
        >
          {tc('ok')}
        </Button>,
      ]}
      maskClosable
      onCancel={closeModal}
      open={open}
      title={t('llm.customModelCards.modelConfig.modalTitle')}
      zIndex={1051} // Select is 1050
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
      >
        <Form
          colon={false}
          form={formInstance}
          initialValues={modelCard}
          labelCol={{ span: 4 }}
          preserve={false}
          style={{ marginTop: 16 }}
          wrapperCol={{ offset: 1, span: 18 }}
        >
          <Form.Item
            extra={t('llm.customModelCards.modelConfig.id.extra')}
            label={t('llm.customModelCards.modelConfig.id.title')}
            name={'id'}
          >
            <Input placeholder={t('llm.customModelCards.modelConfig.id.placeholder')} />
          </Form.Item>
          {showAzureDeployName && (
            <Form.Item
              extra={t('llm.customModelCards.modelConfig.azureDeployName.extra')}
              label={t('llm.customModelCards.modelConfig.azureDeployName.title')}
              name={'deploymentName'}
            >
              <Input
                placeholder={t('llm.customModelCards.modelConfig.azureDeployName.placeholder')}
              />
            </Form.Item>
          )}
          <Form.Item
            label={t('llm.customModelCards.modelConfig.displayName.title')}
            name={'displayName'}
          >
            <Input placeholder={t('llm.customModelCards.modelConfig.displayName.placeholder')} />
          </Form.Item>
          <Form.Item label={t('llm.customModelCards.modelConfig.tokens.title')} name={'tokens'}>
            <MaxTokenSlider />
          </Form.Item>
          <Form.Item
            extra={t('llm.customModelCards.modelConfig.functionCall.extra')}
            label={t('llm.customModelCards.modelConfig.functionCall.title')}
            name={'functionCall'}
            valuePropName={'checked'}
          >
            <Checkbox />
          </Form.Item>
          <Form.Item
            extra={t('llm.customModelCards.modelConfig.vision.extra')}
            label={t('llm.customModelCards.modelConfig.vision.title')}
            name={'vision'}
            valuePropName={'checked'}
          >
            <Checkbox />
          </Form.Item>
          <Form.Item
            extra={t('llm.customModelCards.modelConfig.files.extra')}
            label={t('llm.customModelCards.modelConfig.files.title')}
            name={'files'}
            valuePropName={'checked'}
          >
            <Checkbox />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
});
export default ModelConfigModal;
