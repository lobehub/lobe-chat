'use client';

import { Icon, Tag } from '@lobehub/ui';
import Link from 'next/link';
import { useRouter } from 'nextjs-toploader/app';
import qs from 'query-string';
import { memo, useMemo } from 'react';

import { SCROLL_PARENT_ID } from '@/app/[variants]/(main)/discover/features/const';
import { useQuery } from '@/hooks/useQuery';
import { useDiscoverStore } from '@/store/discover';
import { PluginCategory } from '@/types/discover';

import CategoryMenu from '../../../../components/CategoryMenu';
import { useCategory } from './useCategory';

const Category = memo(() => {
  const usePluginCategories = useDiscoverStore((s) => s.usePluginCategories);
  const { category = 'all', q } = useQuery() as { category?: PluginCategory; q?: string };
  const { data: items = [] } = usePluginCategories({ q });
  const route = useRouter();
  const cates = useCategory();

  const genUrl = (key: PluginCategory) =>
    qs.stringifyUrl(
      {
        query: { category: key === PluginCategory.All ? null : key, q },
        url: '/discover/plugin',
      },
      { skipNull: true },
    );

  const handleClick = (key: PluginCategory) => {
    route.push(genUrl(key));
    const scrollableElement = document?.querySelector(`#${SCROLL_PARENT_ID}`);
    if (!scrollableElement) return;
    scrollableElement.scrollTo({ behavior: 'smooth', top: 0 });
  };
  const total = useMemo(() => items.reduce((acc, item) => acc + item.count, 0), [items]);

  return (
    <CategoryMenu
      items={cates.map((item) => {
        const itemData = items.find((i) => i.category === item.key);
        return {
          extra:
            item.key === 'all'
              ? total > 0 && (
                  <Tag
                    size={'small'}
                    style={{
                      borderRadius: 12,
                      paddingInline: 6,
                    }}
                  >
                    {total}
                  </Tag>
                )
              : itemData && (
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
          label: <Link href={genUrl(item.key)}>{item.label}</Link>,
        };
      })}
      mode={'inline'}
      onClick={(v) => handleClick(v.key as PluginCategory)}
      selectedKeys={[category]}
    />
  );
});

export default Category;
