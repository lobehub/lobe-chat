'use client';

import { Form, type FormGroupItemType, Select } from '@lobehub/ui';
import { Switch } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

import { sttOptions } from './const';

const TTS_SETTING_KEY = 'tts';

const STT = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm();
  const settings = useUserStore(settingsSelectors.currentSettings, isEqual);
  const [setSettings] = useUserStore((s) => [s.setSettings]);

  const stt: FormGroupItemType = {
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
        layout: 'horizontal',
        minWidth: undefined,
        name: [TTS_SETTING_KEY, 'sttAutoStop'],
        valuePropName: 'checked',
      },
    ],
    title: t('settingTTS.stt'),
  };

  return (
    <Form
      form={form}
      initialValues={settings}
      items={[stt]}
      itemsType={'group'}
      onValuesChange={setSettings}
      variant={'borderless'}
      {...FORM_STYLE}
    />
  );
});

export default STT;
