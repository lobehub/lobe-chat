import { Checkbox, Form, FormInstance, Input } from 'antd';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import MaxTokenSlider from '@/components/MaxTokenSlider';
import { useIsMobile } from '@/hooks/useIsMobile';
import { AiModelType } from '@/types/aiModel';
import { ChatModelCard } from '@/types/llm';

interface ModelConfigFormProps {
  idEditable?: boolean;
  initialValues?: ChatModelCard;
  onFormInstanceReady: (instance: FormInstance) => void;
  showAzureDeployName?: boolean;
  type?: AiModelType;
}

const ModelConfigForm = memo<ModelConfigFormProps>(
  ({ showAzureDeployName, idEditable = true, onFormInstanceReady, initialValues }) => {
    const { t } = useTranslation('modelProvider');

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
            extra={t('providerModels.item.modelConfig.id.extra')}
            label={t('providerModels.item.modelConfig.id.title')}
            name={'id'}
            rules={[{ required: true }]}
          >
            <Input
              disabled={!idEditable}
              placeholder={t('providerModels.item.modelConfig.id.placeholder')}
            />
          </Form.Item>
          {showAzureDeployName && (
            <Form.Item
              extra={t('providerModels.item.modelConfig.azureDeployName.extra')}
              label={t('providerModels.item.modelConfig.azureDeployName.title')}
              name={['config', 'deploymentName']}
            >
              <Input
                placeholder={t('providerModels.item.modelConfig.azureDeployName.placeholder')}
              />
            </Form.Item>
          )}
          <Form.Item
            label={t('providerModels.item.modelConfig.displayName.title')}
            name={'displayName'}
          >
            <Input placeholder={t('providerModels.item.modelConfig.displayName.placeholder')} />
          </Form.Item>
          <Form.Item
            extra={t('providerModels.item.modelConfig.tokens.extra')}
            label={t('providerModels.item.modelConfig.tokens.title')}
            name={'contextWindowTokens'}
          >
            <MaxTokenSlider />
          </Form.Item>
          <Form.Item
            extra={t('providerModels.item.modelConfig.functionCall.extra')}
            label={t('providerModels.item.modelConfig.functionCall.title')}
            name={['abilities', 'functionCall']}
            valuePropName={'checked'}
          >
            <Checkbox />
          </Form.Item>
          <Form.Item
            extra={t('providerModels.item.modelConfig.vision.extra')}
            label={t('providerModels.item.modelConfig.vision.title')}
            name={['abilities', 'vision']}
            valuePropName={'checked'}
          >
            <Checkbox />
          </Form.Item>
          <Form.Item
            extra={t('providerModels.item.modelConfig.reasoning.extra')}
            label={t('providerModels.item.modelConfig.reasoning.title')}
            name={['abilities', 'reasoning']}
            valuePropName={'checked'}
          >
            <Checkbox />
          </Form.Item>
          {/*<Form.Item*/}
          {/*  extra={t('providerModels.item.modelConfig.files.extra')}*/}
          {/*  label={t('providerModels.item.modelConfig.files.title')}*/}
          {/*  name={['abilities', 'files']}*/}
          {/*  valuePropName={'checked'}*/}
          {/*>*/}
          {/*  <Checkbox />*/}
          {/*</Form.Item>*/}
        </Form>
      </div>
    );
  },
);
export default ModelConfigForm;
