import { Icon } from '@lobehub/ui';
import { Bot, Brain, BrainCircuit, House, Puzzle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';

import type { MenuProps } from '@/components/Menu';
import { useDiscoverTab } from '@/hooks/useDiscoverTab';
import { DiscoverTab } from '@/types/discover';

export const useNav = () => {
  const pathname = usePathname();
  const type = useDiscoverTab();
  const { t } = useTranslation('discover');
  const iconSize = { fontSize: 16 };

  const activeKey = useMemo(() => {
    for (const value of Object.values(DiscoverTab)) {
      if (pathname === '/discover/search') {
        return type;
      } else if (pathname.includes(urlJoin('/discover', value))) {
        return value;
      }
    }
    return DiscoverTab.Home;
  }, [pathname]);

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        icon: <Icon icon={House} size={iconSize} />,
        key: DiscoverTab.Home,
        label: t('tab.home'),
      },
      {
        icon: <Icon icon={Bot} size={iconSize} />,
        key: DiscoverTab.Assistants,
        label: t('tab.assistants'),
      },
      {
        icon: <Icon icon={Puzzle} size={iconSize} />,
        key: DiscoverTab.Plugins,
        label: t('tab.plugins'),
      },
      {
        icon: <Icon icon={Brain} size={iconSize} />,
        key: DiscoverTab.Models,
        label: t('tab.models'),
      },
      {
        icon: <Icon icon={BrainCircuit} size={iconSize} />,
        key: DiscoverTab.Providers,
        label: t('tab.providers'),
      },
    ],
    [t],
  );

  const activeItem = items.find((item: any) => item.key === activeKey) as {
    icon: ReactNode;
    key: string;
    label: string;
  };

  return {
    activeItem,
    activeKey,
    items,
  };
};
