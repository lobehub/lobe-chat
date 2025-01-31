'use client';

import { ProviderIcon } from '@lobehub/icons';
import { Icon } from '@lobehub/ui';
import { MenuProps } from 'antd';
import { useTheme } from 'antd-style';
import { LayoutPanelTop } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';

import { useQueryRoute } from '@/hooks/useQueryRoute';
import { DiscoverProviderItem } from '@/types/discover';

import CategoryMenu, { ICON_SIZE } from '../../../components/CategoryMenu';

const Category = memo<{ data: DiscoverProviderItem[] }>(({ data }) => {
  const pathname = usePathname();
  const selectedKey = useMemo(() => {
    if (pathname.includes('/discover/models/')) {
      return pathname.split('/')[3]?.split('?')[0];
    }
    return 'all';
  }, [pathname]);
  const router = useQueryRoute();
  const theme = useTheme();

  const { t } = useTranslation('discover');
  const items: MenuProps['items'] = [
    {
      icon: <Icon color={theme.colorTextSecondary} icon={LayoutPanelTop} size={ICON_SIZE} />,
      key: 'all',
      label: t('category.plugin.all'),
    },
    ...data.map((item) => ({
      icon: (
        <ProviderIcon
          provider={item.identifier}
          size={18}
          style={{ color: theme.colorTextSecondary }}
          type={'mono'}
        />
      ),
      key: item.identifier,
      label: item.meta.title,
    })),
  ];

  return (
    <CategoryMenu
      items={items.map((item: any) => ({
        ...item,
        label: (
          <Link href={urlJoin('/discover/models', item.key === 'all' ? '' : item.key)}>
            {item.label}
          </Link>
        ),
      }))}
      onSelect={({ key }) => router.push(urlJoin('/discover/models', key === 'all' ? '' : key))}
      selectedKeys={[selectedKey || 'all']}
    />
  );
});

export default Category;
