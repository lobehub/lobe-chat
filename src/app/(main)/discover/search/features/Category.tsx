'use client';

import Link from 'next/link';
import { memo } from 'react';
import urlJoin from 'url-join';

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
          label: <Link href={urlJoin('/discover/search', item.key)}>{item.label}</Link>,
        }))}
      onSelect={({ key }) => router.push(urlJoin('/discover/search', key))}
      selectedKeys={[activeKey]}
    />
  );
});

export default Category;
