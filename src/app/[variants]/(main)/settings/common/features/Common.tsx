'use client';

import { Form, type ItemGroup } from '@lobehub/ui';
import { App, Button, Input } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useSyncSettings } from '@/app/[variants]/(main)/settings/hooks/useSyncSettings';
import { FORM_STYLE } from '@/const/layoutTokens';
import { DEFAULT_SETTINGS } from '@/const/settings';
import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

type SettingItemGroup = ItemGroup;

const Common = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm();

  const showAccessCodeConfig = useServerConfigStore(serverConfigSelectors.enabledAccessCode);

  const settings = useUserStore(settingsSelectors.currentSettings, isEqual);
  const [setSettings, resetSettings] = useUserStore((s) => [s.setSettings, s.resetSettings]);

  const { message, modal } = App.useApp();

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
        name: ['keyVaults', 'password'],
      },
      {
        children: (
          <Button danger onClick={handleReset} type="primary">
            {t('danger.reset.action')}
          </Button>
        ),
        desc: t('danger.reset.desc'),
        label: t('danger.reset.title'),
        minWidth: undefined,
      },
    ],
    title: t('settingSystem.title'),
  };

  useSyncSettings(form);

  return (
    <Form
      form={form}
      initialValues={settings}
      items={[system]}
      itemsType={'group'}
      onValuesChange={setSettings}
      variant={'pure'}
      {...FORM_STYLE}
    />
  );
});

export default Common;
