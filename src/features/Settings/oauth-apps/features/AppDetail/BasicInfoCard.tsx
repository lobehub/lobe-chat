'use client';

import { Flexbox } from '@lobehub/ui';
import { Button, Input, Text, TextArea } from '@lobehub/ui/base-ui';
import { Form, useForm } from '@lobehub/ui/base-ui/form';
import { PencilIcon } from 'lucide-react';
import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AvatarUpload from '@/components/AvatarUpload';
import { type OAuthAppItem, type UpdateOAuthAppParams } from '@/types/oauthApp';

import { useLogoUpload } from '../../useLogoUpload';
import AppLogo, { AppLogoPlaceholder } from '../AppLogo';
import SectionCard from './SectionCard';

const LOGO_SIZE = 64;

interface BasicInfoValues {
  description?: string;
  name: string;
}

interface BasicInfoCardProps {
  canEdit: boolean;
  detail: OAuthAppItem;
  onSubmit: (value: UpdateOAuthAppParams) => Promise<void>;
}

/**
 * Name, logo and description, read-only until the user asks to edit. The edit
 * form is reset to the saved values each time editing starts, so cancelling
 * needs no reset and a half-typed change never lingers into the next edit.
 */
const BasicInfoCard: FC<BasicInfoCardProps> = ({ canEdit, detail, onSubmit }) => {
  const { t } = useTranslation('auth');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoUri, setLogoUri] = useState<string | null>(detail.logoUri ?? null);
  // Only a logo the user actually touched is sent. Older apps may still hold an
  // inline `data:` logo the server no longer accepts, and renaming such an app
  // must not fail on a field nobody edited.
  const [logoChanged, setLogoChanged] = useState(false);
  const { upload: uploadLogo, uploading: logoUploading } = useLogoUpload();

  const form = useForm<BasicInfoValues>({ onSubmit: (values) => handleFinish(values) });

  const startEditing = () => {
    form.reset({ description: detail.description ?? '', name: detail.name });
    setLogoUri(detail.logoUri ?? null);
    setLogoChanged(false);
    setEditing(true);
  };

  const handleUpload = async (file: File) => {
    const url = await uploadLogo(file);
    if (!url) return;
    setLogoUri(url);
    setLogoChanged(true);
  };

  const handleDeleteLogo = () => {
    setLogoUri(null);
    setLogoChanged(true);
  };

  const handleFinish = async (values: BasicInfoValues) => {
    setSaving(true);
    try {
      await onSubmit({
        description: values.description,
        name: values.name.trim(),
        ...(logoChanged ? { logoUri } : {}),
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const itemStyle = { paddingBlock: 0 };

  return (
    <SectionCard
      title={t('oauthApp.detail.basicInfo')}
      extra={
        !editing && (
          <Button
            disabled={!canEdit}
            icon={<PencilIcon size={14} />}
            size={'small'}
            onClick={startEditing}
          >
            {t('oauthApp.detail.edit')}
          </Button>
        )
      }
    >
      {editing ? (
        <Form form={form} layout={'vertical'}>
          <Flexbox gap={16}>
            {/* Same logo-beside-name layout as the create modal. */}
            <Flexbox horizontal align={'flex-end'} gap={16}>
              <AvatarUpload
                allowDelete={!!logoUri}
                loading={logoUploading}
                placeholder={<AppLogoPlaceholder dashed size={LOGO_SIZE} />}
                size={LOGO_SIZE}
                title={t('oauthApp.form.logo.label')}
                value={logoUri ?? undefined}
                onDelete={handleDeleteLogo}
                onUpload={handleUpload}
              />
              <Form.Field
                label={t('oauthApp.form.name.label')}
                name={'name'}
                required={t('oauthApp.validation.nameRequired')}
                style={{ ...itemStyle, flex: 1, minWidth: 0 }}
              >
                <Input placeholder={t('oauthApp.form.name.placeholder')} />
              </Form.Field>
            </Flexbox>

            <Form.Field
              label={t('oauthApp.form.description.label')}
              name={'description'}
              style={itemStyle}
            >
              <TextArea placeholder={t('oauthApp.form.description.placeholder')} rows={2} />
            </Form.Field>

            <Flexbox horizontal gap={8} justify={'flex-end'}>
              <Button onClick={() => setEditing(false)}>{t('oauthApp.detail.cancel')}</Button>
              <Button
                disabled={logoUploading}
                htmlType={'submit'}
                loading={saving}
                type={'primary'}
              >
                {t('oauthApp.detail.save')}
              </Button>
            </Flexbox>
          </Flexbox>
        </Form>
      ) : (
        <Flexbox horizontal align={'center'} gap={16}>
          <AppLogo logoUri={detail.logoUri} name={detail.name} size={LOGO_SIZE} />
          <Flexbox gap={4} style={{ minWidth: 0 }}>
            <Text strong style={{ fontSize: 16 }}>
              {detail.name}
            </Text>
            <Text type={'secondary'}>
              {detail.description || t('oauthApp.detail.noDescription')}
            </Text>
          </Flexbox>
        </Flexbox>
      )}
    </SectionCard>
  );
};

export default BasicInfoCard;
