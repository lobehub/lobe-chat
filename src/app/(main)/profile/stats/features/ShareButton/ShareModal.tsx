'use client';

import { type FormItemProps, FormModal, FormModalProps } from '@lobehub/ui';
import { Segmented } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ImageType, imageTypeOptions, useScreenshot } from '@/hooks/useScreenshot';

import Preview from './Preview';

const useStyles = createStyles(({ css, prefixCls }) => ({
  preview: css`
    .${prefixCls}-form-item-label {
      display: none;
    }
  `,
}));

type FieldType = {
  imageType: ImageType;
};

const DEFAULT_FIELD_VALUE: FieldType = {
  imageType: ImageType.JPG,
};

const ShareModal = memo<FormModalProps>(({ open, onCancel }) => {
  const { t } = useTranslation(['chat', 'common']);
  const [fieldValue, setFieldValue] = useState<FieldType>(DEFAULT_FIELD_VALUE);
  const { styles } = useStyles();
  const { loading, onDownload } = useScreenshot({
    imageType: fieldValue.imageType,
    title: 'stats',
  });

  const items: FormItemProps[] = [
    {
      children: <Preview />,
      className: styles.preview,
      divider: false,
      minWidth: '100%',
    },
    {
      children: <Segmented options={imageTypeOptions} />,
      divider: false,
      label: t('shareModal.imageType'),
      minWidth: undefined,
      name: 'imageType',
    },
  ];

  return (
    <FormModal
      allowFullscreen
      footer={null}
      initialValues={DEFAULT_FIELD_VALUE}
      items={items}
      itemsType={'flat'}
      onCancel={onCancel}
      onFinish={onDownload}
      onValuesChange={(_, v) => setFieldValue(v)}
      open={open}
      submitLoading={loading}
      submitText={t('shareModal.download')}
      title={t('share', { ns: 'common' })}
      width={480}
    />
  );
});

export default ShareModal;
