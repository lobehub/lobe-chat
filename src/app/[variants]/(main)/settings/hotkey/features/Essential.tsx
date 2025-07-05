'use client';

import { Form, type FormGroupItemType, HotkeyInput, Icon } from '@lobehub/ui';
import { Skeleton } from 'antd';
import isEqual from 'fast-deep-equal';
import { Loader2Icon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HOTKEYS_REGISTRATION } from '@/const/hotkeys';
import { FORM_STYLE } from '@/const/layoutTokens';
import { isDesktop } from '@/const/version';
import hotkeyMeta from '@/locales/default/hotkey';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { HotkeyGroupEnum, HotkeyId, HotkeyItem } from '@/types/hotkey';

const filterByDesktop = (item: HotkeyItem) => {
  if (isDesktop) return true;

  // is not desktop, filter out desktop only items
  if (!isDesktop) return !item.isDesktop;
};

const HotkeySetting = memo(() => {
  const { t } = useTranslation(['setting', 'hotkey']);
  const [form] = Form.useForm();

  const { hotkey } = useUserStore(settingsSelectors.currentSettings, isEqual);
  const [setSettings, isUserStateInit] = useUserStore((s) => [s.setSettings, s.isUserStateInit]);
  const [loading, setLoading] = useState(false);

  const handleValuesChange = async (values: Record<string, string>) => {
    setLoading(true);

    try {
      // 更新Web端配置
      await setSettings({ hotkey: values });

      // 如果是桌面端，同步更新桌面端配置
      if (isDesktop) {
        const { electronShortcutService } = await import('@/services/electron/shortcut');
        for (const [webId, accelerator] of Object.entries(values)) {
          const id = webId as HotkeyId;

          // 检查快捷键是否需要桌面端同步
          const hotkeyConfig = HOTKEYS_REGISTRATION.find((item) => item.id === id);
          if (!hotkeyConfig?.isDesktop) {
            continue;
          }

          const currentValue = hotkey[id];

          if (currentValue !== accelerator) {
            await electronShortcutService.updateMappedShortcutConfig(webId, accelerator);
          }
        }
      }
    } catch (error) {
      console.error('[Web] Essential: Failed to update shortcuts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isUserStateInit) return <Skeleton active paragraph={{ rows: 5 }} title={false} />;

  const mapHotkeyItem = (item: HotkeyItem) => {
    const hotkeyConflicts = Object.entries(hotkey)
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
      name: item.id,
    };
  };

  const essential: FormGroupItemType = {
    children: HOTKEYS_REGISTRATION.filter((item) => item.group === HotkeyGroupEnum.Essential)
      .filter((item) => filterByDesktop(item))
      .map((item) => mapHotkeyItem(item)),
    extra: loading && <Icon icon={Loader2Icon} size={16} spin style={{ opacity: 0.5 }} />,
    title: t('hotkey.group.essential'),
  };

  return (
    <Form
      form={form}
      initialValues={hotkey}
      items={[essential]}
      itemsType={'group'}
      onValuesChange={handleValuesChange}
      variant={'borderless'}
      {...FORM_STYLE}
    />
  );
});

export default HotkeySetting;
