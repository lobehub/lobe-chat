import { isDesktop } from '@lobechat/const';
import {
  Brain,
  Database,
  EthernetPort,
  Image as ImageIcon,
  Info,
  KeyboardIcon,
  Mic2,
  Settings2,
  Sparkles,
} from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SettingsTabs } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

export enum SettingsGroupKey {
  AIConfig = 'ai-config',
  Account = 'account',
  System = 'system',
}

export interface CategoryItem {
  icon: any;
  key: SettingsTabs;
  label: string;
}

export interface CategoryGroup {
  items: CategoryItem[];
  key: SettingsGroupKey;
  title: string;
}

export const useCategory = () => {
  const { t } = useTranslation('setting');
  const mobile = useServerConfigStore((s) => s.isMobile);
  const { enableSTT, hideDocs, showAiImage } = useServerConfigStore(featureFlagsSelectors);

  const categoryGroups: CategoryGroup[] = useMemo(() => {
    const groups: CategoryGroup[] = [];

    // 账号组 - 个人相关设置
    const accountItems: CategoryItem[] = [
      {
        icon: Settings2,
        key: SettingsTabs.Common,
        label: t('tab.common'),
      },
      !mobile && {
        icon: KeyboardIcon,
        key: SettingsTabs.Hotkey,
        label: t('tab.hotkey'),
      },
    ].filter(Boolean) as CategoryItem[];

    groups.push({
      items: accountItems,
      key: SettingsGroupKey.Account,
      title: t('group.account'),
    });

    // AI 配置组 - AI 相关设置
    const aiConfigItems: CategoryItem[] = [
      {
        icon: Brain,
        key: SettingsTabs.Provider,
        label: t('tab.provider'),
      },
      showAiImage && {
        icon: ImageIcon,
        key: SettingsTabs.Image,
        label: t('tab.image'),
      },
      enableSTT && {
        icon: Mic2,
        key: SettingsTabs.TTS,
        label: t('tab.tts'),
      },
      {
        icon: Sparkles,
        key: SettingsTabs.SystemAgent,
        label: t('tab.system-agent'),
      },
    ].filter(Boolean) as CategoryItem[];

    groups.push({
      items: aiConfigItems,
      key: SettingsGroupKey.AIConfig,
      title: t('group.aiConfig'),
    });

    // 系统组 - 系统相关设置
    const systemItems: CategoryItem[] = [
      isDesktop && {
        icon: EthernetPort,
        key: SettingsTabs.Proxy,
        label: t('tab.proxy'),
      },
      {
        icon: Database,
        key: SettingsTabs.Storage,
        label: t('tab.storage'),
      },
      !hideDocs && {
        icon: Info,
        key: SettingsTabs.About,
        label: t('tab.about'),
      },
    ].filter(Boolean) as CategoryItem[];

    groups.push({
      items: systemItems,
      key: SettingsGroupKey.System,
      title: t('group.system'),
    });

    return groups;
  }, [t, enableSTT, hideDocs, mobile, showAiImage]);

  return categoryGroups;
};
