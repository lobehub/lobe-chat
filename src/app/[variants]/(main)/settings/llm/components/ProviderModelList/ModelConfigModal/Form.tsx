import { Input } from '@lobehub/ui';
import { Checkbox, Form, FormInstance } from 'antd';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import MaxTokenSlider from '@/components/MaxTokenSlider';
import { useIsMobile } from '@/hooks/useIsMobile';
import { ChatModelCard } from '@/types/llm';

interface ModelConfigFormProps {
  initialValues?: ChatModelCard;
  onFormInstanceReady: (instance: FormInstance) => void;
  showAzureDeployName?: boolean;
}

const ModelConfigForm = memo<ModelConfigFormProps>(
  ({ showAzureDeployName, onFormInstanceReady, initialValues }) => {
    const { t } = useTranslation('setting');

    const [formInstance] = Form.useForm();

    const isMobile = useIsMobile();

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
          initialValues={initialValues}
          labelCol={{ span: 4 }}
          style={{ marginTop: 16 }}
          wrapperCol={isMobile ? { span: 18 } : { offset: 1, span: 18 }}
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
          <Form.Item
            label={t('llm.customModelCards.modelConfig.tokens.title')}
            name={'contextWindowTokens'}
          >
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
