'use client';

import { MAX_OAUTH_REDIRECT_URIS } from '@lobechat/utils/oauthApp';
import { Flexbox, Input, TextArea } from '@lobehub/ui';
import { Button } from '@lobehub/ui/base-ui';
import { Form } from 'antd';
import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AvatarUpload from '@/components/AvatarUpload';
import { type OAuthAppItem, type UpdateOAuthAppParams } from '@/types/oauthApp';

import { joinRedirectUris, splitRedirectUris, validateRedirectUrisInput } from '../../redirectUris';

interface AppFormValues {
  description?: string;
  name: string;
  redirectUris?: string;
}

interface EditFormProps {
  canEdit: boolean;
  detail: OAuthAppItem;
  onSubmit: (value: UpdateOAuthAppParams) => Promise<void>;
}

const EditForm: FC<EditFormProps> = ({ canEdit, detail, onSubmit }) => {
  const { t } = useTranslation('auth');
  const [form] = Form.useForm<AppFormValues>();
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoUri, setLogoUri] = useState<string | undefined>(detail.logoUri ?? undefined);

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setLogoUri(reader.result as string);
      setDirty(true);
    });
    reader.readAsDataURL(file);
  };

  const isWebApp = detail.applicationType === 'web';

  const handleFinish = async (values: AppFormValues) => {
    setSaving(true);
    try {
      await onSubmit({
        description: values.description,
        logoUri,
        name: values.name.trim(),
        redirectUris: isWebApp ? splitRedirectUris(values.redirectUris) : undefined,
      });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form
      colon={false}
      disabled={!canEdit}
      form={form}
      layout={'vertical'}
      initialValues={{
        description: detail.description ?? '',
        name: detail.name,
        redirectUris: joinRedirectUris(detail.redirectUris),
      }}
      onFinish={handleFinish}
      onValuesChange={() => setDirty(true)}
    >
      <Flexbox gap={16}>
        <Form.Item label={t('oauthApp.form.logo.label')} style={{ marginBottom: 0 }}>
          <AvatarUpload
            title={detail.name}
            value={logoUri}
            onUpload={canEdit ? handleUpload : undefined}
          />
        </Form.Item>

        <Form.Item
          label={t('oauthApp.form.name.label')}
          name={'name'}
          rules={[{ message: t('oauthApp.validation.nameRequired'), required: true }]}
          style={{ marginBottom: 0 }}
        >
          <Input placeholder={t('oauthApp.form.name.placeholder')} />
        </Form.Item>

        {isWebApp && (
          <Form.Item
            extra={t('oauthApp.form.redirectUris.extra')}
            label={t('oauthApp.form.redirectUris.label')}
            name={'redirectUris'}
            style={{ marginBottom: 0 }}
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
          style={{ marginBottom: 0 }}
        >
          <TextArea placeholder={t('oauthApp.form.description.placeholder')} rows={3} />
        </Form.Item>

        <Flexbox horizontal justify={'flex-end'}>
          <Button
            disabled={!canEdit || !dirty}
            htmlType={'submit'}
            loading={saving}
            type={'primary'}
          >
            {t('oauthApp.detail.save')}
          </Button>
        </Flexbox>
      </Flexbox>
    </Form>
  );
};

export default EditForm;
