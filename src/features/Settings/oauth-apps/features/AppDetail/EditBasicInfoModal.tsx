'use client';

import { Flexbox } from '@lobehub/ui';
import {
  Button,
  createModal,
  Input,
  type ModalInstance,
  TextArea,
  useModalContext,
} from '@lobehub/ui/base-ui';
import { Form, useForm } from '@lobehub/ui/base-ui/form';
import { t } from 'i18next';
import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AvatarUpload from '@/components/AvatarUpload';
import { type OAuthAppItem, type UpdateOAuthAppParams } from '@/types/oauthApp';

import { useLogoUpload } from '../../useLogoUpload';
import { AppLogoPlaceholder } from '../AppLogo';

const LOGO_SIZE = 64;

interface BasicInfoValues {
  description?: string;
  name: string;
}

interface EditBasicInfoContentProps {
  detail: OAuthAppItem;
  onSubmit: (value: UpdateOAuthAppParams) => Promise<void>;
}

const EditBasicInfoContent: FC<EditBasicInfoContentProps> = ({ detail, onSubmit }) => {
  const { t } = useTranslation('auth');
  const { close, setCanDismissByClickOutside } = useModalContext();
  const [saving, setSaving] = useState(false);
  const [logoUri, setLogoUri] = useState<string | null>(detail.logoUri ?? null);
  // Only a logo the user actually touched is sent. Older apps may still hold an
  // inline `data:` logo the server no longer accepts, and renaming such an app
  // must not fail on a field nobody edited.
  const [logoChanged, setLogoChanged] = useState(false);
  const { upload: uploadLogo, uploading: logoUploading } = useLogoUpload();

  // Once anything changes, a mask click must not drop the edit; ✕ / Esc still close.
  const markDirty = () => setCanDismissByClickOutside(false);

  const handleFinish = async (values: BasicInfoValues) => {
    setSaving(true);
    try {
      await onSubmit({
        description: values.description,
        name: values.name.trim(),
        ...(logoChanged ? { logoUri } : {}),
      });
      close();
    } finally {
      setSaving(false);
    }
  };

  const form = useForm<BasicInfoValues>({
    initialValues: { description: detail.description ?? '', name: detail.name },
    onSubmit: handleFinish,
    onValuesChange: markDirty,
  });

  const handleUpload = async (file: File) => {
    const url = await uploadLogo(file);
    if (!url) return;
    setLogoUri(url);
    setLogoChanged(true);
    markDirty();
  };

  const handleDeleteLogo = () => {
    setLogoUri(null);
    setLogoChanged(true);
    markDirty();
  };

  const itemStyle = { paddingBlock: 0 };

  return (
    <Form form={form} layout={'vertical'}>
      <Flexbox gap={16}>
        {/* Same logo-beside-name layout as the create modal. */}
        <Flexbox horizontal align={'flex-end'} gap={16}>
          <AvatarUpload
            allowDelete={!!logoUri}
            loading={logoUploading}
            placeholder={<AppLogoPlaceholder size={LOGO_SIZE} />}
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
            <Input placeholder={t('oauthApp.form.name.placeholder')} variant={'filled'} />
          </Form.Field>
        </Flexbox>

        <Form.Field
          label={t('oauthApp.form.description.label')}
          name={'description'}
          style={itemStyle}
        >
          <TextArea
            placeholder={t('oauthApp.form.description.placeholder')}
            rows={2}
            variant={'filled'}
          />
        </Form.Field>

        <Flexbox horizontal gap={8} justify={'flex-end'} style={{ marginTop: 8 }}>
          <Button onClick={close}>{t('oauthApp.detail.cancel')}</Button>
          <Button disabled={logoUploading} htmlType={'submit'} loading={saving} type={'primary'}>
            {t('oauthApp.detail.save')}
          </Button>
        </Flexbox>
      </Flexbox>
    </Form>
  );
};

/**
 * Edits the app's name, logo and description in a modal, the same shape as the
 * create modal. Opened from the Basic Info card, which stays read-only.
 */
export const openEditBasicInfoModal = (props: EditBasicInfoContentProps): ModalInstance =>
  createModal({
    content: <EditBasicInfoContent {...props} />,
    footer: null,
    maskClosable: true,
    styles: {
      content: { paddingBlock: 16, paddingInline: 24 },
    },
    title: t('oauthApp.form.editTitle', { ns: 'auth' }),
    width: 'min(90vw, 560px)',
  });
