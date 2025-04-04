'use client';

import { Form, HotkeyInput, type ItemGroup } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { HOTKEYS_REGISTRATION } from '@/const/hotkeys';
import { FORM_STYLE } from '@/const/layoutTokens';
import { isDesktop } from '@/const/version';
import hotkeyMeta from '@/locales/default/hotkey';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { HotkeyGroupEnum, HotkeyItem } from '@/types/hotkey';

const filterByDesktop = (item: HotkeyItem) => {
  if (isDesktop) return true;

  // is not desktop, filter out desktop only items
  if (!isDesktop) return !item.isDesktop;
};

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
          placeholder={t('hotkey.record')}
          resetValue={item.keys}
          texts={{
            conflicts: t('hotkey.conflicts'),
            invalidCombination: t('hotkey.invalidCombination'),
            reset: t('hotkey.reset'),
          }}
        />
      ),
      desc: hotkeyMeta[item.id].desc ? t(`${item.id}.desc`, { ns: 'hotkey' }) : undefined,
      label: t(`${item.id}.title`, { ns: 'hotkey' }),
      name: [HOTKEY_SETTING_KEY, item.id],
    };
  };

  const essential: SettingItemGroup = {
    children: HOTKEYS_REGISTRATION.filter((item) => item.group === HotkeyGroupEnum.Essential)
      .filter((item) => filterByDesktop(item))
      .map((item) => mapHotkeyItem(item)),
    title: t('hotkey.group.essential'),
  };

  const conversation: SettingItemGroup = {
    children: HOTKEYS_REGISTRATION.filter((item) => item.group === HotkeyGroupEnum.Conversation)
      .filter((item) => filterByDesktop(item))
      .map((item) => mapHotkeyItem(item)),
    title: t('hotkey.group.conversation'),
  };

  return (
    <Form
      form={form}
      initialValues={settings}
      items={[essential, conversation]}
      itemsType={'group'}
      onValuesChange={setSettings}
      variant={'pure'}
      {...FORM_STYLE}
    />
  );
});

export default HotkeySetting;
