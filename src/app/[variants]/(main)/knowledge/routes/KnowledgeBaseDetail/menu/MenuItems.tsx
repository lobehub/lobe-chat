'use client';

import { Icon } from '@lobehub/ui';
import { FileText, Settings2Icon } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useLocation, useNavigate } from 'react-router-dom';

import Menu from '@/components/Menu';
import type { MenuProps } from '@/components/Menu';

const MenuItems = memo<{ id: string }>(({ id }) => {
  const { t } = useTranslation('knowledgeBase');
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey = location.pathname.includes('/settings') ? 'settings' : 'files';

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        icon: <Icon icon={FileText} />,
        key: 'files',
        label: t('tab.files'),
      },
      {
        icon: <Icon icon={Settings2Icon} />,
        key: 'settings',
        label: t('tab.settings'),
      },
    ],
    [t],
  );

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'files') {
      navigate(`/bases/${id}`);
    } else if (key === 'settings') {
      navigate(`/bases/${id}/settings`);
    }
  };

  return (
    <Flexbox>
      <Menu compact items={items} onClick={handleMenuClick} selectable selectedKeys={[activeKey]} />
    </Flexbox>
  );
});

MenuItems.displayName = 'MenuItems';

export default MenuItems;
