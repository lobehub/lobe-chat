'use client';

import { VoiceList } from '@lobehub/tts';
import { Form, ItemGroup } from '@lobehub/ui';
import { Form as AFrom, Select, Switch } from 'antd';
import isEqual from 'fast-deep-equal';
import { debounce } from 'lodash-es';
import { Mic } from 'lucide-react';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

import { useStore } from '../store';
import SelectWithTTSPreview from './SelectWithTTSPreview';
import { ttsOptions } from './options';

const TTS_SETTING_KEY = 'tts';
const { openaiVoiceOptions, localeOptions } = VoiceList;

const AgentTTS = memo(() => {
  const { t } = useTranslation('setting');
  const updateConfig = useStore((s) => s.setAgentConfig);
  const [form] = AFrom.useForm();
  const voiceList = useUserStore((s) => {
    const locale = settingsSelectors.currentLanguage(s);
    return (all?: boolean) => new VoiceList(all ? undefined : locale);
  });
  const config = useStore((s) => s.config, isEqual);

  useEffect(() => {
    form.setFieldsValue(config);
  }, [config]);

  const showAllLocaleVoice = config.tts.showAllLocaleVoice;

  const { edgeVoiceOptions, microsoftVoiceOptions } = voiceList(showAllLocaleVoice);

  const tts: ItemGroup = {
    children: [
      {
        children: <Select options={ttsOptions} />,
        desc: t('settingTTS.ttsService.desc'),
        label: t('settingTTS.ttsService.title'),
        name: [TTS_SETTING_KEY, 'ttsService'],
      },
      {
        children: <Switch />,
        desc: t('settingTTS.showAllLocaleVoice.desc'),
        hidden: config.tts.ttsService === 'openai',
        label: t('settingTTS.showAllLocaleVoice.title'),
        minWidth: undefined,
        name: [TTS_SETTING_KEY, 'showAllLocaleVoice'],
        valuePropName: 'checked',
      },
      {
        children: <SelectWithTTSPreview options={openaiVoiceOptions} server={'openai'} />,
        desc: t('settingTTS.voice.desc'),
        hidden: config.tts.ttsService !== 'openai',
        label: t('settingTTS.voice.title'),
        name: [TTS_SETTING_KEY, 'voice', 'openai'],
      },
      {
        children: <SelectWithTTSPreview options={edgeVoiceOptions} server={'edge'} />,
        desc: t('settingTTS.voice.desc'),
        divider: false,
        hidden: config.tts.ttsService !== 'edge',
        label: t('settingTTS.voice.title'),
        name: [TTS_SETTING_KEY, 'voice', 'edge'],
      },
      {
        children: <SelectWithTTSPreview options={microsoftVoiceOptions} server={'microsoft'} />,
        desc: t('settingTTS.voice.desc'),
        divider: false,
        hidden: config.tts.ttsService !== 'microsoft',
        label: t('settingTTS.voice.title'),
        name: [TTS_SETTING_KEY, 'voice', 'microsoft'],
      },
      {
        children: (
          <Select
            options={[
              { label: t('settingTheme.lang.autoMode'), value: 'auto' },
              ...(localeOptions || []),
            ]}
          />
        ),
        desc: t('settingTTS.sttLocale.desc'),
        label: t('settingTTS.sttLocale.title'),
        name: [TTS_SETTING_KEY, 'sttLocale'],
      },
    ],
    icon: Mic,
    title: t('settingTTS.title'),
  };

  return (
    <Form
      form={form}
      initialValues={{
        [TTS_SETTING_KEY]: {
          voice: {
            edge: edgeVoiceOptions?.[0].value,
            microsoft: microsoftVoiceOptions?.[0].value,
            openai: openaiVoiceOptions?.[0].value,
          },
        },
      }}
      items={[tts]}
      itemsType={'group'}
      onValuesChange={debounce(updateConfig, 100)}
      variant={'pure'}
      {...FORM_STYLE}
    />
  );
});

export default AgentTTS;
