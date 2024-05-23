import { Checkbox, Form, FormInstance, Input } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/store/user';
import { modelConfigSelectors } from '@/store/user/selectors';

import MaxTokenSlider from './MaxTokenSlider';

interface ModelConfigFormProps {
  onFormInstanceReady: (instance: FormInstance) => void;
  showAzureDeployName?: boolean;
}

const ModelConfigForm = memo<ModelConfigFormProps>(
  ({ showAzureDeployName, onFormInstanceReady }) => {
    const { t } = useTranslation('setting');

    const [id, editingProvider] = useUserStore((s) => [
      s.editingCustomCardModel?.id,
      s.editingCustomCardModel?.provider,
    ]);

    const modelCard = useUserStore(
      modelConfigSelectors.getCustomModelCard({ id, provider: editingProvider }),
      isEqual,
    );

    const [formInstance] = Form.useForm();

    useEffect(() => {
      onFormInstanceReady(formInstance);
    }, []);

    return (
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
    );
  },
);
export default ModelConfigForm;
