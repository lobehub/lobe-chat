import { MCP } from '@lobehub/icons';
import { Dropdown, Icon } from '@lobehub/ui';
import { Bot, Brain, BrainCircuit, House, Puzzle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';

import type { MenuProps } from '@/components/Menu';
import { useDiscoverTab } from '@/hooks/useDiscoverTab';
import { DiscoverTab } from '@/types/discover';

const ICON_SIZE = 16;

export const useNav = () => {
  const pathname = usePathname();
  const type = useDiscoverTab();
  const { t } = useTranslation('discover');

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
            {t('tab.assistants')}
          </Link>
        ),
      },
      {
        icon: <MCP className={'anticon'} size={ICON_SIZE} />,
        key: DiscoverTab.Mcp,
        label: (
          <Dropdown
            menu={{
              items: [
                {
                  icon: <MCP className={'anticon'} size={ICON_SIZE} />,
                  key: DiscoverTab.Mcp,
                  label: (
                    <Link href={urlJoin('/discover', DiscoverTab.Mcp)} style={{ color: 'inherit' }}>
                      {'MCP Servers'}
                    </Link>
                  ),
                },
                {
                  icon: <Icon icon={Puzzle} size={ICON_SIZE} />,
                  key: DiscoverTab.Plugins,
                  label: (
                    <Link
                      href={urlJoin('/discover', DiscoverTab.Plugins)}
                      style={{ color: 'inherit' }}
                    >
                      {t('tab.plugins')}
                    </Link>
                  ),
                },
              ],
            }}
            placement={'bottom'}
          >
            <Link href={urlJoin('/discover', DiscoverTab.Mcp)} style={{ color: 'inherit' }}>
              {t('tab.plugins')}
            </Link>
          </Dropdown>
        ),
      },
      {
        icon: <Icon icon={Brain} size={ICON_SIZE} />,
        key: DiscoverTab.Models,
        label: (
          <Link href={urlJoin('/discover', DiscoverTab.Models)} style={{ color: 'inherit' }}>
            {t('tab.models')}
          </Link>
        ),
      },
      {
        icon: <Icon icon={BrainCircuit} size={ICON_SIZE} />,
        key: DiscoverTab.Providers,
        label: (
          <Link href={urlJoin('/discover', DiscoverTab.Providers)} style={{ color: 'inherit' }}>
            {t('tab.providers')}
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
