'use client';

import { Form, type ItemGroup, SelectWithImg, SliderWithInput } from '@lobehub/ui';
import { Select } from 'antd';
import isEqual from 'fast-deep-equal';
import { Monitor, Moon, Sun } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSyncSettings } from '@/app/[variants]/(main)/settings/hooks/useSyncSettings';
import { FORM_STYLE } from '@/const/layoutTokens';
import { imageUrl } from '@/const/url';
import { Locales, localeOptions } from '@/locales/resources';
import { useGlobalStore } from '@/store/global';
import { useUserStore } from '@/store/user';
import { settingsSelectors, userGeneralSettingsSelectors } from '@/store/user/selectors';

import { ThemeSwatchesNeutral, ThemeSwatchesPrimary } from './ThemeSwatches';

type SettingItemGroup = ItemGroup;

const Theme = memo(() => {
  const { t } = useTranslation('setting');

  const [form] = Form.useForm();
  const settings = useUserStore(settingsSelectors.currentSettings, isEqual);
  const themeMode = useUserStore(userGeneralSettingsSelectors.currentThemeMode);
  const [setThemeMode, setSettings] = useUserStore((s) => [s.switchThemeMode, s.setSettings]);

  useSyncSettings(form);
  const [switchLocale] = useGlobalStore((s) => [s.switchLocale]);

  const handleLangChange = (value: Locales) => {
    switchLocale(value);
  };

  const theme: SettingItemGroup = {
    children: [
      {
        children: (
          <SelectWithImg
            height={60}
            onChange={setThemeMode}
            options={[
              {
                icon: Sun,
                img: imageUrl('theme_light.webp'),
                label: t('settingTheme.themeMode.light'),
                value: 'light',
              },
              {
                icon: Moon,
                img: imageUrl('theme_dark.webp'),
                label: t('settingTheme.themeMode.dark'),
                value: 'dark',
              },
              {
                icon: Monitor,
                img: imageUrl('theme_auto.webp'),
                label: t('settingTheme.themeMode.auto'),
                value: 'auto',
              },
            ]}
            unoptimized={false}
            value={themeMode}
            width={100}
          />
        ),
        label: t('settingTheme.themeMode.title'),
        minWidth: undefined,
      },
      {
        children: (
          <Select
            onChange={handleLangChange}
            options={[{ label: t('settingTheme.lang.autoMode'), value: 'auto' }, ...localeOptions]}
          />
        ),
        label: t('settingTheme.lang.title'),
        name: ['general', 'language'],
      },
      {
        children: (
          <SliderWithInput
            marks={{
              12: {
                label: 'A',
                style: {
                  fontSize: 12,
                  marginTop: 4,
                },
              },
              14: {
                label: t('settingTheme.fontSize.marks.normal'),
                style: {
                  fontSize: 14,
                  marginTop: 4,
                },
              },
              18: {
                label: 'A',
                style: {
                  fontSize: 18,
                  marginTop: 4,
                },
              },
            }}
            max={18}
            min={12}
            step={1}
          />
        ),
        desc: t('settingTheme.fontSize.desc'),
        label: t('settingTheme.fontSize.title'),
        name: ['general', 'fontSize'],
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
    title: t('settingTheme.title'),
  };

  return (
    <Form
      form={form}
      initialValues={settings}
      items={[theme]}
      itemsType={'group'}
      onValuesChange={setSettings}
      variant={'pure'}
      {...FORM_STYLE}
    />
  );
});

export default Theme;
