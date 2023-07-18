import { Form, type ItemGroup, ThemeSwitch } from '@lobehub/ui';
import { Select, Slider } from 'antd';
import isEqual from 'fast-deep-equal';
import { debounce } from 'lodash-es';
import { Palette } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';

import AvatarWithUpload from '@/features/AvatarWithUpload';
import { options } from '@/locales/options';
import { settingsSelectors, useSettings } from '@/store/settings';
import { ConfigKeys } from '@/types/exportConfig';

import { ThemeSwatchesNeutral, ThemeSwatchesPrimary } from './ThemeSwatches';

type SettingItemGroup = ItemGroup & {
  children: {
    name?: ConfigKeys;
  }[];
};

const SettingForm = memo(() => {
  const settings = useSettings(settingsSelectors.currentSettings, isEqual);
  const { setThemeMode, setSettings } = useSettings(
    (s) => ({ setSettings: s.setSettings, setThemeMode: s.setThemeMode }),
    shallow,
  );

  const { t } = useTranslation('setting');

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
          children: <Slider max={18} min={12} />,
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

  return (
    <Form
      initialValues={settings}
      itemMinWidth="min(30%,200px)"
      items={[theme]}
      onValuesChange={debounce(setSettings, 100)}
      style={{ maxWidth: 1024, width: '100%' }}
    />
  );
});

export default SettingForm;
