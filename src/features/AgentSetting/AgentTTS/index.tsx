import { getAzureVoiceOptions, getEdgeVoiceOptions, getOpenaiVoiceOptions } from '@lobehub/tts';
import { Form, ItemGroup } from '@lobehub/ui';
import { Form as AFrom, Select, Switch } from 'antd';
import isEqual from 'fast-deep-equal';
import { debounce } from 'lodash-es';
import { Mic } from 'lucide-react';
import { memo, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { settingsSelectors, useGlobalStore } from '@/store/global';

import { useStore } from '../store';
import { sstOptions, ttsOptions } from './options';

const TTS_SETTING_KEY = 'tts';

const AgentTTS = memo(() => {
  const { t } = useTranslation('setting');
  const updateConfig = useStore((s) => s.setAgentConfig);
  const [form] = AFrom.useForm();
  const locale = useGlobalStore(settingsSelectors.currentLanguage);
  const config = useStore((s) => s.config, isEqual);

  useEffect(() => {
    form.setFieldsValue(config);
  }, [config]);
  const showAllLocaleVoice = config.tts.showAllLocaleVoice;
  const openaiVoiceOptions = useMemo(() => getOpenaiVoiceOptions(), []);
  const edgeVoiceOptions = useMemo(
    () => getEdgeVoiceOptions(showAllLocaleVoice ? undefined : locale),
    [locale, showAllLocaleVoice],
  );
  const microsoftVoiceOptions = useMemo(
    () => getAzureVoiceOptions(showAllLocaleVoice ? undefined : locale),
    [locale, showAllLocaleVoice],
  );
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
        divider: false,
        hidden: config.tts.ttsService === 'openai',
        label: t('settingTTS.showAllLocaleVoice.title'),
        minWidth: undefined,
        name: [TTS_SETTING_KEY, 'showAllLocaleVoice'],
        valuePropName: 'checked',
      },
      {
        children: (
          <Select defaultValue={openaiVoiceOptions?.[0].value} options={openaiVoiceOptions} />
        ),
        divider: false,

        hidden: config.tts.ttsService !== 'openai',
        label: t('settingTTS.voice.title'),
        name: [TTS_SETTING_KEY, 'voice', 'openai'],
      },
      {
        children: <Select defaultValue={edgeVoiceOptions?.[0].value} options={edgeVoiceOptions} />,
        divider: false,
        hidden: config.tts.ttsService !== 'edge',
        label: t('settingTTS.voice.title'),
        name: [TTS_SETTING_KEY, 'voice', 'edge'],
      },
      {
        children: (
          <Select defaultValue={microsoftVoiceOptions?.[0].value} options={microsoftVoiceOptions} />
        ),
        divider: false,
        hidden: config.tts.ttsService !== 'microsoft',
        label: t('settingTTS.voice.title'),
        name: [TTS_SETTING_KEY, 'voice', 'microsoft'],
      },
      {
        children: <Select options={sstOptions} />,
        desc: t('settingTTS.sttService.desc'),
        label: t('settingTTS.sttService.title'),
        name: [TTS_SETTING_KEY, 'sttService'],
      },
    ],
    icon: Mic,
    title: t('settingTTS.title'),
  };

  return (
    <Form form={form} items={[tts]} onValuesChange={debounce(updateConfig, 100)} {...FORM_STYLE} />
  );
});

export default AgentTTS;
