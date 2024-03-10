import { SiWebrtc } from '@icons-pack/react-simple-icons';
import { Form, type ItemGroup } from '@lobehub/ui';
import { Form as AntForm, Input } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';

import { useSyncSettings } from '../hooks/useSyncSettings';

type SettingItemGroup = ItemGroup;

const Theme = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();

  const settings = useGlobalStore(settingsSelectors.currentSettings, isEqual);
  const [setSettings] = useGlobalStore((s) => [s.setSettings]);

  useSyncSettings(form);

  const config: SettingItemGroup = {
    children: [
      {
        children: <Input placeholder={t('sync.webrtc.channelName.placeholder')} />,
        desc: t('sync.webrtc.channelName.desc'),
        label: t('sync.webrtc.channelName.title'),
        name: ['sync', 'channelName'],
      },
    ],
    icon: SiWebrtc,
    title: t('sync.webrtc.title'),
  };

  return (
    <Form
      form={form}
      initialValues={settings}
      items={[config]}
      onValuesChange={setSettings}
      {...FORM_STYLE}
    />
  );
});

export default Theme;
