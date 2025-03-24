'use client';

import { Form, HotkeyInput, type ItemGroup } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { HOTKEYS_REGISTRATION } from '@/const/hotkeys';
import { FORM_STYLE } from '@/const/layoutTokens';
import hotkeyMeta from '@/locales/default/hotkey';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

type SettingItemGroup = ItemGroup;

const HOTKEY_SETTING_KEY = 'hotkey';

const CommonHotkeys = memo(() => {
  const { t } = useTranslation(['setting', 'hotkey']);
  const [form] = Form.useForm();

  const settings = useUserStore(settingsSelectors.currentSettings, isEqual);
  const [setSettings] = useUserStore((s) => [s.setSettings]);

  const hotkeys: SettingItemGroup = {
    children: HOTKEYS_REGISTRATION.map((item) => ({
      children: (
        <HotkeyInput hotkeyConflicts={Object.values(settings.hotkey)} resetValue={item.keys} />
      ),
      desc: hotkeyMeta[item.id].desc ? t(`${item.id}.desc`, { ns: 'hotkey' }) : undefined,
      label: t(`${item.id}.title`, { ns: 'hotkey' }),
      name: [HOTKEY_SETTING_KEY, item.id],
    })),
    title: t('hotkey.title'),
  };

  return (
    <Form
      form={form}
      initialValues={settings}
      items={[hotkeys]}
      itemsType={'group'}
      onValuesChange={setSettings}
      variant={'pure'}
      {...FORM_STYLE}
    />
  );
});

export default CommonHotkeys;
