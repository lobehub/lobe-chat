'use client';

import { Icon } from '@lobehub/ui';
import { FileText } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Menu from '@/components/Menu';
import type { MenuProps } from '@/components/Menu';

const CategoryMenu = () => {
  const { t } = useTranslation('knowledgeBase');

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        icon: <Icon icon={FileText} />,
        key: 'files',
        label: t('tab.files'),
      },
    ],
    [t],
  );

  return (
    <Flexbox>
      <Menu compact items={items} selectable selectedKeys={['files']} />
    </Flexbox>
  );
};

CategoryMenu.displayName = 'MenuItems';

export default CategoryMenu;
