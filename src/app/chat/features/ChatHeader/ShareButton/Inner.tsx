import { Form, ItemGroup } from '@lobehub/ui';
import { Button, Segmented, SegmentedProps, Switch } from 'antd';
import { Share2 } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import MobilePadding from '@/components/MobilePadding';
import { FORM_STYLE } from '@/const/layoutTokens';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';

import Preview, { ImageType, imageTypeOptions } from './Preview';

enum Tab {
  Screenshot = 'screenshot',
  ShareGPT = 'sharegpt',
}

const Inner = memo(() => {
  const [withSystemRole, setWithSystemRole] = useState(false);
  const [withPluginInfo, setWithPluginInfo] = useState(false);
  const [withBackground, setWithBackground] = useState(true);
  const [withFooter, setWithFooter] = useState(false);
  const [imageType, setImageType] = useState<ImageType>(ImageType.JPG);
  const [tab, setTab] = useState<Tab>(Tab.Screenshot);
  const { t } = useTranslation('chat');

  const avatar = useGlobalStore((s) => s.settings.avatar);
  const [shareLoading, shareToShareGPT] = useChatStore((s) => [s.shareLoading, s.shareToShareGPT]);

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

  const settings: ItemGroup = useMemo(
    () =>
      ({
        children: [
          {
            children: <Switch checked={withSystemRole} onChange={setWithSystemRole} />,
            label: t('shareModal.withSystemRole'),
            minWidth: undefined,
          },
          tab === Tab.Screenshot && {
            children: <Switch checked={withBackground} onChange={setWithBackground} />,
            label: t('shareModal.withBackground'),
            minWidth: undefined,
          },
          tab === Tab.Screenshot && {
            children: <Switch checked={withFooter} onChange={setWithFooter} />,
            label: t('shareModal.withFooter'),
            minWidth: undefined,
          },
          tab === Tab.Screenshot && {
            children: (
              <Segmented
                onChange={(value) => setImageType(value as ImageType)}
                options={imageTypeOptions}
                value={imageType}
              />
            ),
            label: t('shareModal.imageType'),
            minWidth: undefined,
          },
          tab === Tab.ShareGPT && {
            children: <Switch checked={withPluginInfo} onChange={setWithPluginInfo} />,
            label: t('shareModal.withPluginInfo'),
            minWidth: undefined,
          },
        ].filter(Boolean),
        icon: Share2,
        title: t('shareModal.settings'),
      }) as ItemGroup,
    [tab, withSystemRole, withPluginInfo, withBackground, withFooter, imageType],
  );

  return (
    <Flexbox gap={16}>
      <MobilePadding bottom={0}>
        <Segmented
          block
          onChange={(value) => setTab(value as Tab)}
          options={options}
          style={{ width: '100%' }}
          value={tab}
        />
      </MobilePadding>
      <Form items={[settings]} {...FORM_STYLE} />
      <MobilePadding gap={16} top={0}>
        {tab === Tab.Screenshot && (
          <Preview
            imageType={imageType}
            withBackground={withBackground}
            withFooter={withFooter}
            withSystemRole={withSystemRole}
          />
        )}
        {tab === Tab.ShareGPT && (
          <Button
            block
            loading={shareLoading}
            onClick={() => shareToShareGPT({ avatar, withPluginInfo, withSystemRole })}
            size={'large'}
            type={'primary'}
          >
            {t('shareModal.shareToShareGPT')}
          </Button>
        )}
      </MobilePadding>
    </Flexbox>
  );
});

export default Inner;
