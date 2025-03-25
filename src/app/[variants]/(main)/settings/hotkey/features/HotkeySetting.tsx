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
import { HotkeyGroupEnum, HotkeyItem } from '@/types/hotkey';

type SettingItemGroup = ItemGroup;

const HOTKEY_SETTING_KEY = 'hotkey';

const HotkeySetting = memo(() => {
  const { t } = useTranslation(['setting', 'hotkey']);
  const [form] = Form.useForm();

  const settings = useUserStore(settingsSelectors.currentSettings, isEqual);
  const [setSettings] = useUserStore((s) => [s.setSettings]);

  const mapHotkeyItem = (item: HotkeyItem) => {
    const hotkeyConflicts = Object.entries(settings.hotkey)
      .map(([key, value]) => {
        if (key === item.id) return false;
        return value;
      })
      .filter(Boolean) as string[];
    return {
      children: (
        <HotkeyInput
          disabled={item.nonEditable}
          hotkeyConflicts={hotkeyConflicts}
          resetValue={item.keys}
        />
      ),
      desc: hotkeyMeta[item.id].desc ? t(`${item.id}.desc`, { ns: 'hotkey' }) : undefined,
      label: t(`${item.id}.title`, { ns: 'hotkey' }),
      name: [HOTKEY_SETTING_KEY, item.id],
    };
  };

  const system: SettingItemGroup = {
    children: HOTKEYS_REGISTRATION.filter((item) => item.group === HotkeyGroupEnum.System).map(
      (item) => mapHotkeyItem(item),
    ),
    title: t('hotkey.group.system'),
  };

  const conversation: SettingItemGroup = {
    children: HOTKEYS_REGISTRATION.filter(
      (item) => item.group === HotkeyGroupEnum.Conversation,
    ).map((item) => mapHotkeyItem(item)),
    title: t('hotkey.group.conversation'),
  };

  const layout: SettingItemGroup = {
    children: HOTKEYS_REGISTRATION.filter((item) => item.group === HotkeyGroupEnum.Layout).map(
      (item) => mapHotkeyItem(item),
    ),
    title: t('hotkey.group.layout'),
  };

  return (
    <Form
      form={form}
      initialValues={settings}
      items={[system, conversation, layout]}
      itemsType={'group'}
      onValuesChange={setSettings}
      variant={'pure'}
      {...FORM_STYLE}
    />
  );
});

export default HotkeySetting;
