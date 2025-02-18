'use client';

import { Form, type ItemGroup } from '@lobehub/ui';
import { Select } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

import { opeanaiSTTOptions, opeanaiTTSOptions } from './const';

type SettingItemGroup = ItemGroup;

const TTS_SETTING_KEY = 'tts';

const OpenAI = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm();
  const settings = useUserStore(settingsSelectors.currentSettings, isEqual);
  const [setSettings] = useUserStore((s) => [s.setSettings]);

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
    title: t('settingTTS.openai.title'),
  };

  return (
    <Form
      form={form}
      initialValues={settings}
      items={[openai]}
      itemsType={'group'}
      onValuesChange={setSettings}
      variant={'pure'}
      {...FORM_STYLE}
    />
  );
});

export default OpenAI;
