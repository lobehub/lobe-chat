import { MCP } from '@lobehub/icons';
import { Icon } from '@lobehub/ui';
import { Bot, Brain, BrainCircuit, House } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';

import type { MenuProps } from '@/components/Menu';
import { DiscoverTab } from '@/types/discover';

const ICON_SIZE = 16;

export const useNav = () => {
  const pathname = usePathname();
  const { t } = useTranslation('discover');

  const activeKey = useMemo(() => {
    for (const value of Object.values(DiscoverTab)) {
      if (pathname.includes(urlJoin('/discover', DiscoverTab.Plugins))) {
        return DiscoverTab.Mcp;
      } else if (pathname.includes(urlJoin('/discover', value))) {
        return value;
      }
    }
    return DiscoverTab.Home;
  }, [pathname]);

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        icon: <Icon icon={House} size={ICON_SIZE} />,
        key: DiscoverTab.Home,
        label: (
          <Link href={'/discover'} style={{ color: 'inherit' }}>
            {t('tab.home')}
          </Link>
        ),
      },
      {
        icon: <Icon icon={Bot} size={ICON_SIZE} />,
        key: DiscoverTab.Assistants,
        label: (
          <Link href={urlJoin('/discover', DiscoverTab.Assistants)} style={{ color: 'inherit' }}>
            {t('tab.assistant')}
          </Link>
        ),
      },
      {
        icon: <MCP className={'anticon'} size={ICON_SIZE} />,
        key: DiscoverTab.Mcp,
        label: (
          <Link href={urlJoin('/discover', DiscoverTab.Mcp)} style={{ color: 'inherit' }}>
            {`MCP ${t('tab.plugin')}`}
          </Link>
        ),
      },
      {
        icon: <Icon icon={Brain} size={ICON_SIZE} />,
        key: DiscoverTab.Models,
        label: (
          <Link href={urlJoin('/discover', DiscoverTab.Models)} style={{ color: 'inherit' }}>
            {t('tab.model')}
          </Link>
        ),
      },
      {
        icon: <Icon icon={BrainCircuit} size={ICON_SIZE} />,
        key: DiscoverTab.Providers,
        label: (
          <Link href={urlJoin('/discover', DiscoverTab.Providers)} style={{ color: 'inherit' }}>
            {t('tab.provider')}
          </Link>
        ),
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
