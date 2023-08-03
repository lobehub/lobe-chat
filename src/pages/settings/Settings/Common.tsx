import { Form, type ItemGroup, ThemeSwitch } from '@lobehub/ui';
import { Form as AntForm, App, Button, Input, Select } from 'antd';
import isEqual from 'fast-deep-equal';
import { debounce } from 'lodash-es';
import { AppWindow, Palette, Webhook } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SliderWithInput from 'src/components/SliderWithInput';
import { shallow } from 'zustand/shallow';

import { FORM_STYLE } from '@/const/layoutTokens';
import { DEFAULT_SETTINGS } from '@/const/settings';
import AvatarWithUpload from '@/features/AvatarWithUpload';
import { options } from '@/locales/options';
import { useSessionStore } from '@/store/session';
import { settingsSelectors, useSettings } from '@/store/settings';
import { ConfigKeys } from '@/types/settings';

import { ThemeSwatchesNeutral, ThemeSwatchesPrimary } from '../ThemeSwatches';

type SettingItemGroup = ItemGroup & {
  children: {
    name?: ConfigKeys | string;
  }[];
};

const Common = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();
  const clearSessions = useSessionStore((s) => s.clearSessions);
  const settings = useSettings(settingsSelectors.currentSettings, isEqual);
  const { setThemeMode, setSettings, resetSettings } = useSettings(
    (s) => ({
      resetSettings: s.resetSettings,
      setSettings: s.setSettings,
      setThemeMode: s.setThemeMode,
    }),
    shallow,
  );

  const { message, modal } = App.useApp();
  const handleReset = useCallback(() => {
    modal.confirm({
      cancelText: t('cancel', { ns: 'common' }),
      centered: true,
      okButtonProps: { danger: true },
      okText: t('ok', { ns: 'common' }),
      onOk: () => {
        resetSettings();
        form.setFieldsValue(DEFAULT_SETTINGS);
      },
      title: t('danger.reset.confirm'),
    });
  }, []);

  const handleClear = useCallback(() => {
    modal.confirm({
      cancelText: t('cancel', { ns: 'common' }),
      centered: true,
      okButtonProps: {
        danger: true,
      },
      okText: t('ok', { ns: 'common' }),
      onOk: () => {
        clearSessions();
        message.success(t('danger.clear.success'));
      },
      title: t('danger.clear.confirm'),
    });
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
            <Button danger onClick={handleReset} type="primary">
              {t('danger.reset.action')}
            </Button>
          ),
          desc: t('danger.reset.title'),
          label: t('danger.reset.desc'),
          minWidth: undefined,
        },
        {
          children: (
            <Button danger onClick={handleClear} type="primary">
              {t('danger.clear.action')}
            </Button>
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

  const items = useMemo(() => [theme, openAI, system], [settings]);

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

export default Common;
