import {
  Gamepad2,
  ImagePlay,
  LayoutPanelTop,
  MicroscopeIcon,
  PocketKnife,
  Receipt,
  ScanSearch,
  TwitterIcon,
  Umbrella,
} from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { PluginCategory } from '@/types/discover';

export const useCategory = () => {
  const { t } = useTranslation('discover');

  return useMemo(
    () => [
      {
        icon: LayoutPanelTop,
        key: PluginCategory.All,
        label: t('category.plugin.all'),
      },
      {
        icon: ImagePlay,
        key: PluginCategory.MediaGenerate,
        label: t('category.plugin.media-generate'),
      },
      {
        icon: ScanSearch,
        key: PluginCategory.WebSearch,
        label: t('category.plugin.web-search'),
      },
      {
        icon: Receipt,
        key: PluginCategory.StocksFinance,
        label: t('category.plugin.stocks-finance'),
      },
      {
        icon: PocketKnife,
        key: PluginCategory.Tools,
        label: t('category.plugin.tools'),
      },
      {
        icon: Umbrella,
        key: PluginCategory.LifeStyle,
        label: t('category.plugin.life-style'),
      },
      {
        icon: MicroscopeIcon,
        key: PluginCategory.ScienceEducation,
        label: t('category.plugin.science-education'),
      },
      {
        icon: TwitterIcon,
        key: PluginCategory.Social,
        label: t('category.plugin.social'),
      },
      {
        icon: Gamepad2,
        key: PluginCategory.GamingEntertainment,
        label: t('category.plugin.gaming-entertainment'),
      },
    ],
    [t],
  );
};

export const useCategoryItem = (key?: PluginCategory) => {
  const items = useCategory();
  if (!key) return;
  return items.find((item) => item.key === key);
};
