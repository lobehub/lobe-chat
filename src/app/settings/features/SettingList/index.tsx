import { Bot, Cloudy, Info, Mic2, Settings2, Webhook } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { featureFlagsSelectors, useFeatureFlagStore } from '@/store/featureFlags';
import { SettingsTabs } from '@/store/global/initialState';

import Item from './Item';

interface TabItem {
  icon: any;
  label: string;
  value: SettingsTabs;
}

export interface SettingListProps {
  activeTab?: SettingsTabs;
  mobile?: boolean;
}

const SettingList = memo<SettingListProps>(({ activeTab, mobile }) => {
  const { t } = useTranslation('setting');
  const { enableWebrtc, showLLM } = useFeatureFlagStore(featureFlagsSelectors);

  const items = [
    { icon: Settings2, label: t('tab.common'), value: SettingsTabs.Common },
    enableWebrtc && { icon: Cloudy, label: t('tab.sync'), value: SettingsTabs.Sync },
    showLLM && { icon: Webhook, label: t('tab.llm'), value: SettingsTabs.LLM },
    { icon: Mic2, label: t('tab.tts'), value: SettingsTabs.TTS },
    { icon: Bot, label: t('tab.agent'), value: SettingsTabs.Agent },
    { icon: Info, label: t('tab.about'), value: SettingsTabs.About },
  ].filter(Boolean) as TabItem[];

  return items.map(({ value, icon, label }) => (
    <Link aria-label={label} href={`/settings/${value}`} key={value}>
      <Item
        active={mobile ? false : activeTab === value}
        hoverable={!mobile}
        icon={icon}
        label={label}
      />
    </Link>
  ));
});

export default SettingList;
