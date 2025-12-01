import { Settings } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Link, useNavigate } from 'react-router-dom';

import NavItem from '@/features/NavPanel/NavItem';
import { useActiveTabKey } from '@/hooks/useActiveTabKey';
import { SidebarTabKey } from '@/store/global/initialState';

interface Item {
  icon: any;
  key: SidebarTabKey;
  title: string;
  url: string;
}

const BottomMenu = memo(() => {
  const tab = useActiveTabKey();

  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const items = useMemo(
    () =>
      [
        {
          icon: Settings,
          key: SidebarTabKey.Setting,
          title: t('tab.setting'),
          url: '/settings',
        },
      ].filter(Boolean) as Item[],
    [t],
  );

  return (
    <Flexbox
      gap={1}
      paddingBlock={4}
      style={{
        overflow: 'hidden',
      }}
    >
      {items.map((item) => (
        <Link
          key={item.key}
          onClick={(e) => {
            e.preventDefault();
            navigate(item.url);
          }}
          to={item.url}
        >
          <NavItem active={tab === item.key} icon={item.icon} title={item.title} />
        </Link>
      ))}
    </Flexbox>
  );
});

export default BottomMenu;
