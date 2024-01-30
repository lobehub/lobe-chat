import { Form, type ItemGroup, SelectWithImg, SliderWithInput } from '@lobehub/ui';
import { Form as AntForm, App, Button, Input, Select } from 'antd';
import isEqual from 'fast-deep-equal';
import { AppWindow, Monitor, Moon, Palette, Sun } from 'lucide-react';
import { memo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { DEFAULT_SETTINGS } from '@/const/settings';
import AvatarWithUpload from '@/features/AvatarWithUpload';
import { localeOptions } from '@/locales/resources';
import { useChatStore } from '@/store/chat';
import { useFileStore } from '@/store/file';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { useToolStore } from '@/store/tool';
import { switchLang } from '@/utils/switchLang';

import { ThemeSwatchesNeutral, ThemeSwatchesPrimary } from '../features/ThemeSwatches';

type SettingItemGroup = ItemGroup;

export interface SettingsCommonProps {
  showAccessCodeConfig: boolean;
}

const Common = memo<SettingsCommonProps>(({ showAccessCodeConfig }) => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();

  const [clearSessions, clearSessionGroups] = useSessionStore((s) => [
    s.clearSessions,
    s.clearSessionGroups,
  ]);
  const [clearTopics, clearAllMessages] = useChatStore((s) => [
    s.removeAllTopics,
    s.clearAllMessages,
  ]);
  const [removeAllFiles] = useFileStore((s) => [s.removeAllFiles]);
  const removeAllPlugins = useToolStore((s) => s.removeAllPlugins);

  const settings = useGlobalStore(settingsSelectors.currentSettings, isEqual);
  const [setThemeMode, setSettings, resetSettings] = useGlobalStore((s) => [
    s.switchThemeMode,
    s.setSettings,
    s.resetSettings,
  ]);

  const { message, modal } = App.useApp();

  const handleReset = useCallback(() => {
    modal.confirm({
      centered: true,
      okButtonProps: { danger: true },
      onOk: () => {
        resetSettings();
        form.setFieldsValue(DEFAULT_SETTINGS);
      },
      title: t('danger.reset.confirm'),
    });
  }, []);

  const handleClear = useCallback(() => {
    modal.confirm({
      centered: true,
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        await clearSessions();
        await removeAllPlugins();
        await clearTopics();
        await removeAllFiles();
        await clearAllMessages();
        await clearSessionGroups();

        message.success(t('danger.clear.success'));
      },
      title: t('danger.clear.confirm'),
    });
  }, []);

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

  const system: SettingItemGroup = {
    children: [
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t('settingSystem.accessCode.placeholder')}
          />
        ),
        desc: t('settingSystem.accessCode.desc'),
        hidden: !showAccessCodeConfig,
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
        desc: t('danger.clear.desc'),
        label: t('danger.clear.title'),
        minWidth: undefined,
      },
    ],
    icon: AppWindow,
    title: t('settingSystem.title'),
  };

  useEffect(() => {
    const unsubscribe = useGlobalStore.subscribe(
      (s) => s.settings,
      (settings) => {
        form.setFieldsValue(settings);
      },
    );
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Form
      form={form}
      initialValues={settings}
      items={[theme, system]}
      onValuesChange={setSettings}
      {...FORM_STYLE}
    />
  );
});

export default Common;
