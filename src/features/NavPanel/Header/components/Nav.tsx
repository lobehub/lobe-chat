'use client';

import { Compass, FilePenIcon, HomeIcon, ImageIcon } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Link, useNavigate } from 'react-router-dom';

import { useActiveTabKey } from '@/hooks/useActiveTabKey';
import { SidebarTabKey } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import NavItem from '../../NavItem';

const Nav = memo(() => {
  const tab = useActiveTabKey();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { showMarket, showAiImage } = useServerConfigStore(featureFlagsSelectors);

  const items = useMemo(
    () => [
      {
        icon: HomeIcon,
        key: SidebarTabKey.Chat,
        title: t('tab.home'),
        url: '/agent',
      },
      {
        hidden: !showAiImage,
        icon: ImageIcon,
        key: SidebarTabKey.Image,
        title: t('tab.image'),
        url: '/image',
      },
      {
        hidden: !showAiImage,
        icon: FilePenIcon,
        key: SidebarTabKey.Pages,
        title: t('tab.pages'),
        url: '/page',
      },
      {
        hidden: !showMarket,
        icon: Compass,
        key: SidebarTabKey.Discover,
        title: t('tab.community'),
        url: '/discover',
      },
    ],
    [t],
  );

  return (
    <Flexbox gap={1}>
      {items.map((item) => (
        <Link
          key={item.key}
          onClick={(e) => {
            e.preventDefault();
            navigate(item.url);
          }}
          to={item.url}
        >
          <NavItem
            active={tab === item.key}
            hidden={item.hidden}
            icon={item.icon}
            title={item.title}
          />
        </Link>
      ))}
    </Flexbox>
  );
});

export default Nav;
