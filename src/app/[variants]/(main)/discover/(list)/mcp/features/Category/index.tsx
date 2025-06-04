'use client';

import { Icon, Tag } from '@lobehub/ui';
import Link from 'next/link';
import qs from 'query-string';
import { memo } from 'react';

import { useQuery } from '@/hooks/useQuery';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useDiscoverStore } from '@/store/discover';
import { McpCategory } from '@/types/discover';

import CategoryMenu from '../../../../components/CategoryMenu';
import { useCategory } from './useCategory';

const Category = memo(() => {
  const usePluginCategories = useDiscoverStore((s) => s.usePluginCategories);
  const { data: items = [] } = usePluginCategories();
  const { category = 'all', q } = useQuery() as { category?: McpCategory; q?: string };
  const route = useQueryRoute();
  const cates = useCategory();

  const handleClick = (key: McpCategory) => {
    route.push('/discover/mcp', {
      query:
        key === 'all'
          ? {}
          : {
              category: key,
            },
      replace: true,
    });
  };

  return (
    <CategoryMenu
      items={cates.map((item) => {
        const itemData = items.find((i) => i.category === item.key);
        return {
          extra: !q && itemData && (
            <Tag
              size={'small'}
              style={{
                borderRadius: 12,
                paddingInline: 6,
              }}
            >
              {itemData.count}
            </Tag>
          ),
          ...item,
          icon: <Icon icon={item.icon} size={18} />,
          label: (
            <Link
              href={qs.stringifyUrl(
                {
                  query: { category: item.key === McpCategory.All ? null : item.key },
                  url: '/discover/mcp',
                },
                { skipNull: true },
              )}
            >
              {item.label}
            </Link>
          ),
        };
      })}
      mode={'inline'}
      onClick={(v) => handleClick(v.key as McpCategory)}
      selectedKeys={[category]}
    />
  );
});

export default Category;
