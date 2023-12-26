import { Form, type FormItemProps, Modal, type ModalProps } from '@lobehub/ui';
import { Button, Segmented, SegmentedProps, Switch } from 'antd';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useScreenshot } from '@/app/chat/features/ChatHeader/ShareButton/useScreenshot';
import { FORM_STYLE } from '@/const/layoutTokens';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';

import Preview, { ImageType, imageTypeOptions } from './Preview';
import { FieldType } from './type';

enum Tab {
  Screenshot = 'screenshot',
  ShareGPT = 'sharegpt',
}

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
  const avatar = useGlobalStore((s) => s.settings.avatar);
  const [shareLoading, shareToShareGPT] = useChatStore((s) => [s.shareLoading, s.shareToShareGPT]);
  const { loading, onDwnload, title } = useScreenshot(fieldValue.imageType);

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
    () =>
      [
        {
          children: <Switch />,
          label: t('shareModal.withSystemRole'),
          minWidth: undefined,
          name: 'withSystemRole',
          valuePropName: 'checked',
        },
        tab === Tab.Screenshot && {
          children: <Switch />,
          label: t('shareModal.withBackground'),
          minWidth: undefined,
          name: 'withBackground',
          valuePropName: 'checked',
        },
        tab === Tab.Screenshot && {
          children: <Switch />,
          label: t('shareModal.withFooter'),
          minWidth: undefined,
          name: 'withFooter',
          valuePropName: 'checked',
        },
        tab === Tab.Screenshot && {
          children: <Segmented options={imageTypeOptions} />,
          label: t('shareModal.imageType'),
          minWidth: undefined,
          name: 'imageType',
        },
        tab === Tab.ShareGPT && {
          children: <Switch />,
          label: t('shareModal.withPluginInfo'),
          minWidth: undefined,
          name: 'withPluginInfo',
          valuePropName: 'checked',
        },
      ].filter(Boolean) as FormItemProps[],
    [],
  );

  return (
    <Modal
      allowFullscreen
      centered={false}
      footer={
        <>
          {tab === Tab.Screenshot && (
            <Button block loading={loading} onClick={onDwnload} size={'large'} type={'primary'}>
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
        <Form
          initialValues={DEFAULT_FIELD_VALUE}
          items={settings}
          itemsType={'flat'}
          onValuesChange={(_, v) => setFieldValue(v)}
          {...FORM_STYLE}
        />
        {tab === Tab.Screenshot && <Preview title={title} {...fieldValue} />}
      </Flexbox>
    </Modal>
  );
});

export default ShareModal;
