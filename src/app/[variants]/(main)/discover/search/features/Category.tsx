'use client';

import Link from 'next/link';
import qs from 'query-string';
import { memo } from 'react';

import { useQueryRoute } from '@/hooks/useQueryRoute';
import { DiscoverTab } from '@/types/discover';

import CategoryMenu from '../../components/CategoryMenu';
import { useNav } from '../../features/useNav';

const Category = memo(() => {
  const router = useQueryRoute();

  const { items, activeKey } = useNav();

  return (
    <CategoryMenu
      items={items
        .filter((item) => item?.key !== DiscoverTab.Home)
        .map((item: any) => ({
          ...item,
          label: (
            <Link
              href={qs.stringifyUrl({
                query: { type: item.key },
                url: '/discover/search',
              })}
            >
              {item.label}
            </Link>
          ),
        }))}
      onSelect={({ key }) => router.push('/discover/search', { query: { type: key } })}
      selectedKeys={[activeKey]}
    />
  );
});

export default Category;
