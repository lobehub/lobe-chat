import { Modal, SliderWithInput } from '@lobehub/ui';
import { Checkbox, Form, Input } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { GlobalLLMProviderKey } from '@/types/settings';

interface ModelConfigModalProps {
  id: string;
  onOpenChange: (open: boolean) => void;
  open?: boolean;
  provider: GlobalLLMProviderKey;
}
const ModelConfigModal = memo<ModelConfigModalProps>(({ open, id, onOpenChange }) => {
  const [formInstance] = Form.useForm();
  const { t } = useTranslation('setting');

  return (
    <Modal
      maskClosable
      onCancel={() => {
        onOpenChange(false);
      }}
      open={open}
      title={t('llm.customModelCards.modelConfig.modalTitle')}
    >
      <Form
        colon={false}
        form={formInstance}
        labelCol={{ offset: 0, span: 4 }}
        style={{ marginTop: 16 }}
        wrapperCol={{ offset: 1, span: 19 }}
      >
        <Form.Item label={t('llm.customModelCards.modelConfig.id.title')} name={'id'}>
          <Input placeholder={t('llm.customModelCards.modelConfig.id.placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('llm.customModelCards.modelConfig.displayName.title')}
          name={'displayName'}
        >
          <Input placeholder={t('llm.customModelCards.modelConfig.displayName.placeholder')} />
        </Form.Item>
        <Form.Item label={t('llm.customModelCards.modelConfig.tokens.title')} name={'tokens'}>
          <SliderWithInput
            marks={{
              100_000: '100k',
              128_000: '128k',
              16_385: '16k',
              200_000: '200k',
              32_768: '32k',
              4096: '4k',
            }}
            max={200_000}
            min={0}
          />
        </Form.Item>
        <Form.Item
          extra={t('llm.customModelCards.modelConfig.functionCall.extra')}
          label={t('llm.customModelCards.modelConfig.functionCall.title')}
          name={'functionCall'}
        >
          <Checkbox />
        </Form.Item>
        <Form.Item
          extra={t('llm.customModelCards.modelConfig.vision.extra')}
          label={t('llm.customModelCards.modelConfig.vision.title')}
          name={'vision'}
        >
          <Checkbox />
        </Form.Item>
        <Form.Item
          extra={t('llm.customModelCards.modelConfig.files.extra')}
          label={t('llm.customModelCards.modelConfig.files.title')}
          name={'files'}
        >
          <Checkbox />
        </Form.Item>
      </Form>
    </Modal>
  );
});
export default ModelConfigModal;
