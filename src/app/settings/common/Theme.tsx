import { Form, type ItemGroup, SelectWithImg, SliderWithInput } from '@lobehub/ui';
import { Form as AntForm, Select } from 'antd';
import isEqual from 'fast-deep-equal';
import { Monitor, Moon, Palette, Sun } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSyncSettings } from '@/app/settings/hooks/useSyncSettings';
import { FORM_STYLE } from '@/const/layoutTokens';
import { imageUrl } from '@/const/url';
import AvatarWithUpload from '@/features/AvatarWithUpload';
import { localeOptions } from '@/locales/resources';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { switchLang } from '@/utils/client/switchLang';

import { ThemeSwatchesNeutral, ThemeSwatchesPrimary } from '../features/ThemeSwatches';

type SettingItemGroup = ItemGroup;

const Theme = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();

  const settings = useUserStore(settingsSelectors.currentSettings, isEqual);
  const [setThemeMode, setSettings] = useUserStore((s) => [s.switchThemeMode, s.setSettings]);

  useSyncSettings(form);

  const theme: SettingItemGroup = {
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
            width={100}
          />
        ),
        label: t('settingTheme.themeMode.title'),
        minWidth: undefined,
      },
      {
        children: (
          <Select
            onChange={switchLang}
            options={[{ label: t('settingTheme.lang.autoMode'), value: 'auto' }, ...localeOptions]}
          />
        ),
        label: t('settingTheme.lang.title'),
        name: 'language',
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
  };

  return (
    <Form
      form={form}
      initialValues={settings}
      items={[theme]}
      onValuesChange={setSettings}
      {...FORM_STYLE}
    />
  );
});

export default Theme;
