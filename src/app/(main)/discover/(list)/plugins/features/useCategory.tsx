import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
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
import { useTranslation } from 'react-i18next';

import { PluginCategory } from '@/types/discover';

import { ICON_SIZE } from '../../../components/CategoryMenu';

export const useCategory = (fontsize?: number) => {
  const theme = useTheme();

  const { t } = useTranslation('discover');

  const size = fontsize ? { fontSize: fontsize } : ICON_SIZE;

  return [
    {
      icon: <Icon color={theme.colorTextSecondary} icon={LayoutPanelTop} size={size} />,
      key: PluginCategory.All,
      label: t('category.plugin.all'),
    },
    {
      icon: <Icon color={theme.colorTextSecondary} icon={ImagePlay} size={size} />,
      key: PluginCategory.MediaGenerate,
      label: t('category.plugin.media-generate'),
    },
    {
      icon: <Icon color={theme.colorTextSecondary} icon={ScanSearch} size={size} />,
      key: PluginCategory.WebSearch,
      label: t('category.plugin.web-search'),
    },
    {
      icon: <Icon color={theme.colorTextSecondary} icon={Receipt} size={size} />,
      key: PluginCategory.StocksFinance,
      label: t('category.plugin.stocks-finance'),
    },
    {
      icon: <Icon color={theme.colorTextSecondary} icon={PocketKnife} size={size} />,
      key: PluginCategory.Tools,
      label: t('category.plugin.tools'),
    },
    {
      icon: <Icon color={theme.colorTextSecondary} icon={Umbrella} size={size} />,
      key: PluginCategory.LifeStyle,
      label: t('category.plugin.life-style'),
    },
    {
      icon: <Icon color={theme.colorTextSecondary} icon={MicroscopeIcon} size={size} />,
      key: PluginCategory.ScienceEducation,
      label: t('category.plugin.science-education'),
    },
    {
      icon: <Icon color={theme.colorTextSecondary} icon={TwitterIcon} size={size} />,
      key: PluginCategory.Social,
      label: t('category.plugin.social'),
    },
    {
      icon: <Icon color={theme.colorTextSecondary} icon={Gamepad2} size={size} />,
      key: PluginCategory.GamingEntertainment,
      label: t('category.plugin.gaming-entertainment'),
    },
  ];
};

export const useCategoryItem = (key?: PluginCategory, fontsize?: number) => {
  const items = useCategory(fontsize);
  if (!key) return;
  return items.find((item) => item.key === key);
};
