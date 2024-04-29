import { Form, type ItemGroup } from '@lobehub/ui';
import { Form as AntForm, App, Button, Input } from 'antd';
import isEqual from 'fast-deep-equal';
import { AppWindow } from 'lucide-react';
import { signIn, signOut } from 'next-auth/react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useSyncSettings } from '@/app/(main)/settings/hooks/useSyncSettings';
import { FORM_STYLE } from '@/const/layoutTokens';
import { DEFAULT_SETTINGS } from '@/const/settings';
import { useOAuthSession } from '@/hooks/useOAuthSession';
import { useChatStore } from '@/store/chat';
import { useFileStore } from '@/store/file';
import { useSessionStore } from '@/store/session';
import { useToolStore } from '@/store/tool';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

type SettingItemGroup = ItemGroup;

export interface SettingsCommonProps {
  showAccessCodeConfig: boolean;
  showOAuthLogin: boolean;
}

const Common = memo<SettingsCommonProps>(({ showAccessCodeConfig, showOAuthLogin }) => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();

  const { user, isOAuthLoggedIn } = useOAuthSession();

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
  const settings = useUserStore(settingsSelectors.currentSettings, isEqual);
  const [setSettings, resetSettings] = useUserStore((s) => [s.setSettings, s.resetSettings]);

  const { message, modal } = App.useApp();

  const handleSignOut = useCallback(() => {
    modal.confirm({
      centered: true,
      okButtonProps: { danger: true },
      onOk: () => {
        signOut();
        message.success(t('settingSystem.oauth.signout.success'));
      },
      title: t('settingSystem.oauth.signout.confirm'),
    });
  }, []);

  const handleSignIn = useCallback(() => {
    signIn();
  }, []);

  const handleReset = useCallback(() => {
    modal.confirm({
      centered: true,
      okButtonProps: { danger: true },
      onOk: () => {
        resetSettings();
        form.setFieldsValue(DEFAULT_SETTINGS);
        message.success(t('danger.reset.success'));
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
        children: isOAuthLoggedIn ? (
          <Button onClick={handleSignOut}>{t('settingSystem.oauth.signout.action')}</Button>
        ) : (
          <Button onClick={handleSignIn} type="primary">
            {t('settingSystem.oauth.signin.action')}
          </Button>
        ),
        desc: isOAuthLoggedIn
          ? `${user?.email} ${t('settingSystem.oauth.info.desc')}`
          : t('settingSystem.oauth.signin.desc'),
        hidden: !showOAuthLogin,
        label: isOAuthLoggedIn
          ? t('settingSystem.oauth.info.title')
          : t('settingSystem.oauth.signin.title'),
        minWidth: undefined,
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

  useSyncSettings(form);

  return (
    <Form
      form={form}
      initialValues={settings}
      items={[system]}
      onValuesChange={setSettings}
      {...FORM_STYLE}
    />
  );
});

export default Common;
