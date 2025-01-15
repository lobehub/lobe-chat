'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useMemo } from 'react';
import urlJoin from 'url-join';

import { useQueryRoute } from '@/hooks/useQueryRoute';
import { PluginCategory } from '@/types/discover';

import CategoryMenu from '../../../components/CategoryMenu';
import { useCategory } from './useCategory';

const Category = memo(() => {
  const items = useCategory();
  const pathname = usePathname();
  const selectedKey = useMemo(() => {
    if (pathname.includes('/discover/plugins/')) {
      return pathname.split('/')[3]?.split('?')[0];
    }
    return 'all';
  }, [pathname]);
  const router = useQueryRoute();

  return (
    <CategoryMenu
      items={items.map((item: any) => ({
        ...item,
        label: (
          <Link
            href={urlJoin('/discover/plugins', item.key === PluginCategory.All ? '' : item.key)}
          >
            {item.label}
          </Link>
        ),
      }))}
      onSelect={({ key }) =>
        router.push(urlJoin('/discover/plugins', key === PluginCategory.All ? '' : key))
      }
      selectedKeys={[selectedKey || 'all']}
    />
  );
});

export default Category;
