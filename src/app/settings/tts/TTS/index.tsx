import { Form, type ItemGroup } from '@lobehub/ui';
import { Form as AntForm, Select, Switch } from 'antd';
import isEqual from 'fast-deep-equal';
import { debounce } from 'lodash-es';
import { Mic, Webhook } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

import { opeanaiSTTOptions, opeanaiTTSOptions, sttOptions } from './options';

type SettingItemGroup = ItemGroup;

const TTS_SETTING_KEY = 'tts';

const TTS = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();
  const settings = useUserStore(settingsSelectors.currentSettings, isEqual);
  const [setSettings] = useUserStore((s) => [s.setSettings]);

  const stt: SettingItemGroup = {
    children: [
      {
        children: <Select options={sttOptions} />,
        desc: t('settingTTS.sttService.desc'),
        label: t('settingTTS.sttService.title'),
        name: [TTS_SETTING_KEY, 'sttServer'],
      },
      {
        children: <Switch />,
        desc: t('settingTTS.sttAutoStop.desc'),
        label: t('settingTTS.sttAutoStop.title'),
        minWidth: undefined,
        name: [TTS_SETTING_KEY, 'sttAutoStop'],
        valuePropName: 'checked',
      },
    ],
    icon: Mic,
    title: t('settingTTS.stt'),
  };

  const openai: SettingItemGroup = {
    children: [
      {
        children: <Select options={opeanaiTTSOptions} />,
        label: t('settingTTS.openai.ttsModel'),
        name: [TTS_SETTING_KEY, 'openAI', 'ttsModel'],
      },
      {
        children: <Select options={opeanaiSTTOptions} />,
        label: t('settingTTS.openai.sttModel'),
        name: [TTS_SETTING_KEY, 'openAI', 'sttModel'],
      },
    ],
    icon: Webhook,
    title: t('settingTTS.openai.title'),
  };

  return (
    <Form
      form={form}
      initialValues={settings}
      items={[stt, openai]}
      onValuesChange={debounce(setSettings, 100)}
      {...FORM_STYLE}
    />
  );
});

export default TTS;
