'use client';

import { type OAuthAppType } from '@lobechat/types';
import { MAX_OAUTH_REDIRECT_URIS } from '@lobechat/utils/oauthApp';
import { Flexbox, Input, TextArea } from '@lobehub/ui';
import { Button, Segmented, Text, useModalContext } from '@lobehub/ui/base-ui';
import { Form } from 'antd';
import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AvatarUpload from '@/components/AvatarUpload';
import { type CreateOAuthAppParams } from '@/types/oauthApp';

import { splitRedirectUris, validateRedirectUrisInput } from '../../redirectUris';

interface CreateAppFormValues {
  description?: string;
  name: string;
  redirectUris?: string;
  type: OAuthAppType;
}

export interface CreateAppModalContentProps {
  onSubmit: (values: CreateOAuthAppParams) => Promise<void>;
}

const CreateAppModalContent: FC<CreateAppModalContentProps> = ({ onSubmit }) => {
  const { t } = useTranslation('auth');
  const { close, setCanDismissByClickOutside } = useModalContext();
  const [form] = Form.useForm<CreateAppFormValues>();
  const [loading, setLoading] = useState(false);
  const [logoUri, setLogoUri] = useState<string>();
  const [type, setType] = useState<OAuthAppType>('device');

  // Once the form is dirty, a mask click must not dismiss the modal (it would
  // silently drop the user's input); the explicit ✕/ESC close still works.
  const markDirty = () => setCanDismissByClickOutside(false);

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setLogoUri(reader.result as string);
      markDirty();
    });
    reader.readAsDataURL(file);
  };

  const handleFinish = async (values: CreateAppFormValues) => {
    setLoading(true);
    try {
      await onSubmit({
        description: values.description,
        logoUri,
        name: values.name,
        redirectUris: values.type === 'web' ? splitRedirectUris(values.redirectUris) : undefined,
        type: values.type,
      });
      close();
    } finally {
      setLoading(false);
    }
  };

  const itemStyle = { marginBottom: 0 };

  return (
    <Form
      colon={false}
      form={form}
      initialValues={{ type: 'device' }}
      layout={'vertical'}
      onFinish={handleFinish}
      onValuesChange={markDirty}
    >
      <Flexbox gap={16}>
        <Form.Item label={t('oauthApp.form.logo.label')} style={itemStyle}>
          <AvatarUpload
            title={t('oauthApp.form.name.label')}
            value={logoUri}
            onUpload={handleUpload}
          />
        </Form.Item>

        <Form.Item
          label={t('oauthApp.form.name.label')}
          name={'name'}
          rules={[{ message: t('oauthApp.validation.nameRequired'), required: true }]}
          style={itemStyle}
        >
          <Input placeholder={t('oauthApp.form.name.placeholder')} />
        </Form.Item>

        <Form.Item label={t('oauthApp.form.type.label')} name={'type'} style={itemStyle}>
          <Segmented<OAuthAppType>
            block
            options={[
              { label: t('oauthApp.type.device'), value: 'device' },
              { label: t('oauthApp.type.web'), value: 'web' },
            ]}
            onChange={setType}
          />
        </Form.Item>

        <Text style={{ fontSize: 12 }} type={'secondary'}>
          {t(type === 'web' ? 'oauthApp.form.type.webDesc' : 'oauthApp.form.type.deviceDesc')}
        </Text>

        {type === 'web' && (
          <Form.Item
            extra={t('oauthApp.form.redirectUris.extra')}
            label={t('oauthApp.form.redirectUris.label')}
            name={'redirectUris'}
            style={itemStyle}
            rules={[
              {
                validator: async (_, value?: string) => {
                  const messageKey = validateRedirectUrisInput(value);
                  if (messageKey)
                    throw new Error(t(messageKey, { count: MAX_OAUTH_REDIRECT_URIS }));
                },
              },
            ]}
          >
            <TextArea placeholder={t('oauthApp.form.redirectUris.placeholder')} rows={3} />
          </Form.Item>
        )}

        <Form.Item
          label={t('oauthApp.form.description.label')}
          name={'description'}
          style={itemStyle}
        >
          <TextArea placeholder={t('oauthApp.form.description.placeholder')} rows={3} />
        </Form.Item>

        <Button block htmlType={'submit'} loading={loading} type={'primary'}>
          {t('oauthApp.form.submit')}
        </Button>
      </Flexbox>
    </Form>
  );
};

export default CreateAppModalContent;
