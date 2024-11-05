import { Form, type FormItemProps } from '@lobehub/ui';
import { Button, Segmented, SegmentedProps, Switch } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useIsMobile } from '@/hooks/useIsMobile';

import Preview from './Preview';
import { FieldType, ImageType } from './type';
import { useScreenshot } from './useScreenshot';

export const imageTypeOptions: SegmentedProps['options'] = [
  {
    label: 'JPG',
    value: ImageType.JPG,
  },
  {
    label: 'PNG',
    value: ImageType.PNG,
  },
  {
    label: 'SVG',
    value: ImageType.SVG,
  },
  {
    label: 'WEBP',
    value: ImageType.WEBP,
  },
];

const DEFAULT_FIELD_VALUE: FieldType = {
  imageType: ImageType.JPG,
  withBackground: true,
  withFooter: true,
  withPluginInfo: false,
  withSystemRole: false,
};

const ShareImage = memo(() => {
  const [fieldValue, setFieldValue] = useState<FieldType>(DEFAULT_FIELD_VALUE);
  const { t } = useTranslation('chat');
  const { loading, onDownload, title } = useScreenshot(fieldValue.imageType);

  const settings: FormItemProps[] = [
    {
      children: <Switch />,
      label: t('shareModal.withSystemRole'),
      minWidth: undefined,
      name: 'withSystemRole',
      valuePropName: 'checked',
    },
    {
      children: <Switch />,
      label: t('shareModal.withBackground'),
      minWidth: undefined,
      name: 'withBackground',
      valuePropName: 'checked',
    },
    {
      children: <Switch />,
      label: t('shareModal.withFooter'),
      minWidth: undefined,
      name: 'withFooter',
      valuePropName: 'checked',
    },
    {
      children: <Segmented options={imageTypeOptions} />,
      label: t('shareModal.imageType'),
      minWidth: undefined,
      name: 'imageType',
    },
  ];

  const isMobile = useIsMobile();
  return (
    <Flexbox gap={16} horizontal={!isMobile}>
      <Preview title={title} {...fieldValue} />
      <Flexbox gap={16}>
        <Form
          initialValues={DEFAULT_FIELD_VALUE}
          items={settings}
          itemsType={'flat'}
          onValuesChange={(_, v) => setFieldValue(v)}
          {...FORM_STYLE}
        />
        <Button
          block
          loading={loading}
          onClick={onDownload}
          size={'large'}
          style={isMobile ? { bottom: 0, position: 'sticky' } : undefined}
          type={'primary'}
        >
          {t('shareModal.download')}
        </Button>
      </Flexbox>
    </Flexbox>
  );
});

export default ShareImage;
