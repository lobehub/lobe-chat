'use client';

import { Compass, FolderClosed, HomeIcon, Palette } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Link, useNavigate } from 'react-router-dom';

import { useNavPanel } from '@/features/NavPanel/hooks/useNavPanel';
import { useActiveTabKey } from '@/hooks/useActiveTabKey';
import { SidebarTabKey } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import NavItem from '../../NavItem';

const Nav = memo(() => {
  const { closePanel, openPanel } = useNavPanel();
  const tab = useActiveTabKey();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { showMarket, enableKnowledgeBase, showAiImage } =
    useServerConfigStore(featureFlagsSelectors);

  const items = useMemo(
    () => [
      {
        icon: HomeIcon,
        key: SidebarTabKey.Chat,
        title: t('tab.chat'),
        url: '/chat',
      },
      {
        hidden: !enableKnowledgeBase,
        icon: FolderClosed,
        key: SidebarTabKey.Knowledge,
        title: t('tab.knowledgeBase'),
        url: '/knowledge',
      },
      {
        hidden: !showAiImage,
        icon: Palette,
        key: SidebarTabKey.Image,
        title: t('tab.aiImage'),
        url: '/image',
      },
      {
        hidden: !showMarket,
        icon: Compass,
        key: SidebarTabKey.Discover,
        title: t('tab.discover'),
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
            if (item.key === SidebarTabKey.Chat) {
              openPanel();
            } else {
              closePanel();
            }
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
