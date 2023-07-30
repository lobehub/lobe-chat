import { Form, type ItemGroup, ThemeSwitch } from '@lobehub/ui';
import { Form as AntForm, Button, Input, Popconfirm, Select, Switch } from 'antd';
import isEqual from 'fast-deep-equal';
import { debounce } from 'lodash-es';
import { AppWindow, BrainCog, MessagesSquare, Palette, Webhook } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SliderWithInput from 'src/components/SliderWithInput';
import { shallow } from 'zustand/shallow';

import { FORM_STYLE } from '@/const/layoutTokens';
import AvatarWithUpload from '@/features/AvatarWithUpload';
import { options } from '@/locales/options';
import { settingsSelectors, useSettings } from '@/store/settings';
import { DEFAULT_SETTINGS } from '@/store/settings/initialState';
import { LanguageModel } from '@/types/llm';
import { ConfigKeys } from '@/types/settings';

import { ThemeSwatchesNeutral, ThemeSwatchesPrimary } from './ThemeSwatches';

type SettingItemGroup = ItemGroup & {
  children: {
    name?: ConfigKeys;
  }[];
};

const SettingForm = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();
  const settings = useSettings(settingsSelectors.currentSettings, isEqual);
  const { setThemeMode, setSettings, resetSettings } = useSettings(
    (s) => ({
      resetSettings: s.resetSettings,
      setSettings: s.setSettings,
      setThemeMode: s.setThemeMode,
    }),
    shallow,
  );

  const handleReset = useCallback(() => {
    resetSettings();
    form.setFieldsValue(DEFAULT_SETTINGS);
  }, []);

  const handleClear = useCallback(() => {
    handleReset();
    // TODO: 删除聊天记录
  }, []);

  const theme: SettingItemGroup = useMemo(
    () => ({
      children: [
        {
          children: <AvatarWithUpload />,
          label: t('settingTheme.avatar.title'),
          minWidth: undefined,
        },
        {
          children: (
            <ThemeSwitch
              labels={{
                auto: t('settingTheme.themeMode.auto'),
                dark: t('settingTheme.themeMode.dark'),
                light: t('settingTheme.themeMode.light'),
              }}
              onThemeSwitch={setThemeMode}
              themeMode={settings.themeMode}
              type={'select'}
            />
          ),
          label: t('settingTheme.themeMode.title'),
        },
        {
          children: <Select options={options} />,
          label: t('settingTheme.lang.title'),
          name: 'language',
        },
        {
          children: <SliderWithInput max={18} min={12} />,
          desc: t('settingTheme.fontSize.desc'),
          label: t('settingTheme.fontSize.title'),
          name: 'fontSize',
        },
        {
          children: <ThemeSwatchesPrimary />,
          desc: t('settingTheme.primaryColor.desc'),
          label: t('settingTheme.primaryColor.title'),
          minWidth: undefined,
        },
        {
          children: <ThemeSwatchesNeutral />,
          desc: t('settingTheme.neutralColor.desc'),
          label: t('settingTheme.neutralColor.title'),
          minWidth: undefined,
        },
      ],
      icon: Palette,
      title: t('settingTheme.title'),
    }),
    [settings],
  );

  const openAI: SettingItemGroup = useMemo(
    () => ({
      children: [
        {
          children: <Input.Password placeholder={t('settingOpenAI.token.placeholder')} />,
          desc: t('settingOpenAI.token.desc'),
          label: t('settingOpenAI.token.title'),
          name: 'OPENAI_API_KEY',
        },
        {
          children: <Input placeholder={t('settingOpenAI.endpoint.placeholder')} />,
          desc: t('settingOpenAI.endpoint.desc'),

          label: t('settingOpenAI.endpoint.title'),

          name: 'endpoint',
        },
      ],
      icon: Webhook,
      title: t('settingOpenAI.title'),
    }),
    [settings],
  );

  const chat: SettingItemGroup = useMemo(
    () => ({
      children: [
        {
          children: <Switch />,
          label: t('settingChat.enableHistoryCount.title'),
          minWidth: undefined,
          name: 'enableHistoryCount',
          valuePropName: 'checked',
        },
        {
          children: <SliderWithInput max={32} min={0} />,
          desc: t('settingChat.historyCount.desc'),
          hidden: !settings.enableHistoryCount,
          label: t('settingChat.historyCount.title'),
          name: 'historyCount',
        },
        {
          children: <Switch />,
          label: t('settingChat.enableCompressThreshold.title'),
          minWidth: undefined,
          name: 'enableCompressThreshold',
          valuePropName: 'checked',
        },
        {
          children: <SliderWithInput max={32} min={0} />,
          desc: t('settingChat.compressThreshold.desc'),
          hidden: !settings.enableCompressThreshold,
          label: t('settingChat.compressThreshold.title'),
          name: 'compressThreshold',
        },
      ],
      icon: MessagesSquare,
      title: t('settingChat.title'),
    }),
    [settings],
  );

  const model: SettingItemGroup = useMemo(
    () => ({
      children: [
        {
          children: (
            <Select
              options={Object.values(LanguageModel).map((value) => ({
                label: value,
                value,
              }))}
            />
          ),
          desc: t('settingModel.model.desc'),
          label: t('settingModel.model.title'),
          name: 'model',
          tag: 'model',
        },
        {
          children: <SliderWithInput max={1} min={0} step={0.1} />,
          desc: t('settingModel.temperature.desc'),
          label: t('settingModel.temperature.title'),
          name: 'temperature',
          tag: 'temperature',
        },
        {
          children: <SliderWithInput max={1} min={0} step={0.1} />,
          desc: t('settingModel.topP.desc'),
          label: t('settingModel.topP.title'),
          name: 'topP',
          tag: 'top_p',
        },
        {
          children: <SliderWithInput max={2} min={-2} step={0.1} />,
          desc: t('settingModel.presencePenalty.desc'),
          label: t('settingModel.presencePenalty.title'),
          name: 'presencePenalty',
          tag: 'presence_penalty',
        },
        {
          children: <SliderWithInput max={2} min={-2} step={0.1} />,
          desc: t('settingModel.frequencyPenalty.desc'),
          label: t('settingModel.frequencyPenalty.title'),
          name: 'frequencyPenalty',
          tag: 'frequency_penalty',
        },
        {
          children: <Switch />,
          label: t('settingModel.enableMaxTokens.title'),
          minWidth: undefined,
          name: 'enableMaxTokens',
          valuePropName: 'checked',
        },
        {
          children: <SliderWithInput max={32_000} min={0} step={100} />,
          desc: t('settingModel.maxTokens.desc'),
          hidden: !settings.enableMaxTokens,
          label: t('settingModel.maxTokens.title'),
          name: 'maxTokens',
          tag: 'max_tokens',
        },
      ],
      icon: BrainCog,
      title: t('settingModel.title'),
    }),
    [settings],
  );

  const system: SettingItemGroup = useMemo(
    () => ({
      children: [
        {
          children: <Input.Password placeholder={t('settingSystem.accessCode.placeholder')} />,
          desc: t('settingSystem.accessCode.desc'),
          label: t('settingSystem.accessCode.title'),
          name: 'password',
        },
        {
          children: (
            <Popconfirm
              arrow={false}
              cancelText={t('cancel', { ns: 'common' })}
              okButtonProps={{ danger: true }}
              okText={t('ok', { ns: 'common' })}
              onConfirm={handleReset}
              title={t('danger.reset.confirm')}
            >
              <Button danger type="primary">
                {t('danger.reset.action')}
              </Button>
            </Popconfirm>
          ),
          desc: t('danger.reset.title'),
          label: t('danger.reset.desc'),
          minWidth: undefined,
        },
        {
          children: (
            <Popconfirm
              arrow={false}
              cancelText={t('cancel', { ns: 'common' })}
              okButtonProps={{ danger: true }}
              okText={t('ok', { ns: 'common' })}
              onConfirm={handleClear}
              title={t('danger.clear.confirm')}
            >
              <Button danger type="primary">
                {t('danger.clear.action')}
              </Button>
            </Popconfirm>
          ),
          desc: t('danger.clear.title'),
          label: t('danger.clear.desc'),
          minWidth: undefined,
        },
      ],
      icon: AppWindow,
      title: t('settingSystem.title'),
    }),
    [settings],
  );

  const items = useMemo(() => [theme, openAI, chat, model, system], [settings]);

  return (
    <Form
      form={form}
      initialValues={settings}
      items={items}
      onValuesChange={debounce(setSettings, 100)}
      {...FORM_STYLE}
    />
  );
});

export default SettingForm;
