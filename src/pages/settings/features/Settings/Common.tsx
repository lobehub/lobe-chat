import { Form, type ItemGroup, SelectWithImg, SliderWithInput } from '@lobehub/ui';
import { Form as AntForm, App, Button, Input, Select } from 'antd';
import isEqual from 'fast-deep-equal';
import { changeLanguage } from 'i18next';
import { debounce } from 'lodash-es';
import { AppWindow, Monitor, Moon, Palette, Sun } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { DEFAULT_SETTINGS } from '@/const/settings';
import AvatarWithUpload from '@/features/AvatarWithUpload';
import { localeOptions } from '@/locales/options';
import { globalSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
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

  const settings = useGlobalStore(globalSelectors.currentSettings, isEqual);
  const [setThemeMode, setSettings, resetSettings] = useGlobalStore((s) => [
    s.switchThemeMode,
    s.setSettings,
    s.resetSettings,
  ]);

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
            <SelectWithImg
              defaultValue={settings.themeMode}
              height={60}
              onChange={setThemeMode}
              options={[
                {
                  icon: Sun,
                  img: '/images/theme_light.webp',
                  label: t('settingTheme.themeMode.light'),
                  value: 'light',
                },
                {
                  icon: Moon,
                  img: '/images/theme_dark.webp',
                  label: t('settingTheme.themeMode.dark'),
                  value: 'dark',
                },
                {
                  icon: Monitor,
                  img: '/images/theme_auto.webp',
                  label: t('settingTheme.themeMode.auto'),
                  value: 'auto',
                },
              ]}
              width={100}
            />
          ),
          label: t('settingTheme.themeMode.title'),
          minWidth: undefined,
        },
        {
          children: (
            <Select
              onChange={(e) => {
                changeLanguage(e);
              }}
              options={localeOptions}
            />
          ),
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

  const items = useMemo(() => [theme, system], [settings]);

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
