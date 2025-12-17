import { Bot, Brain, Info, Mic2, Settings2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CellProps } from '@/components/Cell';
import { SettingsTabs } from '@/store/global/initialState';

export const useCategory = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('setting');

  const items: CellProps[] = [
    {
      icon: Settings2,
      key: SettingsTabs.Common,
      label: t('tab.common'),
    },
    {
      icon: Sparkles,
      key: SettingsTabs.SystemAgent,
      label: t('tab.system-agent'),
    },
    {
      icon: Brain,
      key: SettingsTabs.Provider,
      label: t('tab.provider'),
    },
    { icon: Mic2, key: SettingsTabs.TTS, label: t('tab.tts') },
    {
      icon: Bot,
      key: SettingsTabs.Agent,
      label: t('tab.agent'),
    },
    {
      icon: Info,
      key: SettingsTabs.About,
      label: t('tab.about'),
    },
  ].filter(Boolean) as CellProps[];

  return items.map((item) => ({
    ...item,
    onClick: () => navigate(`/settings?active=${item.key}`),
  }));
};
