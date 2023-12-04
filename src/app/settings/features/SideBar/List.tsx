import { useResponsive } from 'antd-style';
import { Bot, Mic2, Settings2, Webhook } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { SettingsTabs } from '@/store/global/initialState';

import Item from './Item';

const List = memo(() => {
  const { t } = useTranslation('setting');
  const [tab, switchSettingTabs] = useGlobalStore((s) => [s.settingsTab, s.switchSettingTabs]);
  const { mobile } = useResponsive();

  const items = [
    { icon: Settings2, label: t('tab.common'), value: SettingsTabs.Common },
    { icon: Webhook, label: t('tab.llm'), value: SettingsTabs.LLM },
    { icon: Mic2, label: t('tab.tts'), value: SettingsTabs.TTS },
    { icon: Bot, label: t('tab.agent'), value: SettingsTabs.Agent },
  ];

  return items.map(({ value, icon, label }) => (
    <Link
      aria-label={label}
      href={`/settings/${value}`}
      key={value}
      onClick={() => {
        switchSettingTabs(value);
      }}
    >
      <Item active={mobile ? false : tab === value} icon={icon} label={label} />
    </Link>
  ));
});

export default List;
