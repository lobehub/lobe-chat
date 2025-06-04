'use client';

import { ProviderIcon } from '@lobehub/icons';
import { Icon, MenuProps } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { unionBy } from 'lodash-es';
import { LayoutPanelTop } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';

import { useQueryRoute } from '@/hooks/useQueryRoute';
import { DiscoverProviderItem } from '@/types/discover';

import CategoryMenu from '../../../components/CategoryMenu';

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
      icon: LayoutPanelTop,
      key: 'all',
      label: t('category.plugin.all'),
    },
    ...unionBy(data, 'identifier').map((item) => ({
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
        icon: <Icon icon={item.icon} size={18} />,
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
