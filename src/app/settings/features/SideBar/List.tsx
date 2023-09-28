import { useResponsive } from 'antd-style';
import { Bot, Settings2, Webhook } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { SettingsTabs } from '@/store/global/initialState';

import Item from './Item';

const List = memo(() => {
  const { t } = useTranslation('setting');
  const tab = useGlobalStore((s) => s.settingsTab);
  const router = useRouter();
  const { mobile } = useResponsive();
  const items = [
    { icon: Settings2, label: t('tab.common'), value: SettingsTabs.Common },
    { icon: Webhook, label: t('tab.llm'), value: SettingsTabs.LLM },
    { icon: Bot, label: t('tab.agent'), value: SettingsTabs.Agent },
  ];

  return items.map(({ value, icon, label }) => (
    <div key={value} onClick={() => router.push(`/settings/${value}`)}>
      <Item active={mobile ? false : tab === value} icon={icon} label={label} />
    </div>
  ));
});

export default List;
