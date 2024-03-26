import { Form, type FormItemProps, Modal, type ModalProps } from '@lobehub/ui';
import { Button, Segmented, SegmentedProps, Switch } from 'antd';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { commonSelectors } from '@/store/global/selectors';

import Preview from './Preview';
import { FieldType, ImageType } from './type';
import { useScreenshot } from './useScreenshot';

enum Tab {
  Screenshot = 'screenshot',
  ShareGPT = 'sharegpt',
}

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
  withFooter: false,
  withPluginInfo: false,
  withSystemRole: false,
};

const ShareModal = memo<ModalProps>(({ onCancel, open }) => {
  const [fieldValue, setFieldValue] = useState<FieldType>(DEFAULT_FIELD_VALUE);
  const [tab, setTab] = useState<Tab>(Tab.Screenshot);
  const { t } = useTranslation('chat');
  const avatar = useGlobalStore(commonSelectors.userAvatar);
  const [shareLoading, shareToShareGPT] = useChatStore((s) => [s.shareLoading, s.shareToShareGPT]);
  const { loading, onDownload, title } = useScreenshot(fieldValue.imageType);

  const options: SegmentedProps['options'] = useMemo(
    () => [
      {
        label: t('shareModal.screenshot'),
        value: Tab.Screenshot,
      },
      {
        label: 'ShareGPT',
        value: Tab.ShareGPT,
      },
    ],
    [],
  );

  const settings: FormItemProps[] = useMemo(
    () => [
      {
        children: <Switch />,
        label: t('shareModal.withSystemRole'),
        minWidth: undefined,
        name: 'withSystemRole',
        valuePropName: 'checked',
      },
      {
        children: <Switch />,
        hidden: tab !== Tab.Screenshot,
        label: t('shareModal.withBackground'),
        minWidth: undefined,
        name: 'withBackground',
        valuePropName: 'checked',
      },
      {
        children: <Switch />,
        hidden: tab !== Tab.Screenshot,
        label: t('shareModal.withFooter'),
        minWidth: undefined,
        name: 'withFooter',
        valuePropName: 'checked',
      },
      {
        children: <Segmented options={imageTypeOptions} />,
        hidden: tab !== Tab.Screenshot,
        label: t('shareModal.imageType'),
        minWidth: undefined,
        name: 'imageType',
      },
      {
        children: <Switch />,
        hidden: tab !== Tab.ShareGPT,
        label: t('shareModal.withPluginInfo'),
        minWidth: undefined,
        name: 'withPluginInfo',
        valuePropName: 'checked',
      },
    ],
    [tab],
  );

  return (
    <Modal
      allowFullscreen
      centered={false}
      footer={
        <>
          {tab === Tab.Screenshot && (
            <Button block loading={loading} onClick={onDownload} size={'large'} type={'primary'}>
              {t('shareModal.download')}
            </Button>
          )}
          {tab === Tab.ShareGPT && (
            <Button
              block
              loading={shareLoading}
              onClick={() => shareToShareGPT({ avatar, ...fieldValue })}
              size={'large'}
              type={'primary'}
            >
              {t('shareModal.shareToShareGPT')}
            </Button>
          )}
        </>
      }
      maxHeight={false}
      onCancel={onCancel}
      open={open}
      title={t('share', { ns: 'common' })}
    >
      <Flexbox gap={16}>
        <Segmented
          block
          onChange={(value) => setTab(value as Tab)}
          options={options}
          style={{ width: '100%' }}
          value={tab}
        />
        {tab === Tab.Screenshot && <Preview title={title} {...fieldValue} />}
        <Form
          initialValues={DEFAULT_FIELD_VALUE}
          items={settings}
          itemsType={'flat'}
          onValuesChange={(_, v) => setFieldValue(v)}
          {...FORM_STYLE}
        />
      </Flexbox>
    </Modal>
  );
});

export default ShareModal;
