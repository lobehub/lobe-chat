'use client';

import { FileText, ImageIcon, Mic2, ShapesIcon, SquarePlay } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Link, useNavigate } from 'react-router-dom';

import { useFileCategory } from '@/app/[variants]/(main)/resource/features/hooks/useFileCategory';
import NavItem from '@/features/NavPanel/NavItem';
import { FilesTabs } from '@/types/files';

import { useResourceManagerStore } from '../../../features/store';

const CategoryMenu = memo(() => {
  const { t } = useTranslation('file');
  const [activeKey] = useFileCategory();
  const navigate = useNavigate();
  const setMode = useResourceManagerStore((s) => s.setMode);

  const items = useMemo(
    () => [
      {
        icon: ShapesIcon,
        key: FilesTabs.All,
        title: t('tab.all'),
        url: '/resource',
      },
      {
        icon: FileText,
        key: FilesTabs.Documents,
        title: t('tab.documents'),
        url: '/resource?category=documents',
      },
      {
        icon: ImageIcon,
        key: FilesTabs.Images,
        title: t('tab.images'),
        url: '/resource?category=images',
      },
      {
        icon: Mic2,
        key: FilesTabs.Audios,
        title: t('tab.audios'),
        url: '/resource?category=audios',
      },
      {
        icon: SquarePlay,
        key: FilesTabs.Videos,
        title: t('tab.videos'),
        url: '/resource?category=videos',
      },
    ],
    [t],
  );

  return (
    <Flexbox gap={1} paddingInline={4}>
      {items.map((item) => (
        <Link
          key={item.key}
          onClick={(e) => {
            e.preventDefault();
            setMode('files');
            navigate(item.url, { replace: true });
          }}
          to={item.url}
        >
          <NavItem active={activeKey === item.key} icon={item.icon} title={item.title} />
        </Link>
      ))}
    </Flexbox>
  );
});

CategoryMenu.displayName = 'CategoryMenu';

export default CategoryMenu;
