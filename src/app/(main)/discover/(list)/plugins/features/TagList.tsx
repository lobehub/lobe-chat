import { Tag } from '@lobehub/ui';
import { startCase } from 'lodash-es';
import Link from 'next/link';
import qs from 'query-string';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { PluginCategory } from '@/types/discover';

import { useCategoryItem } from './useCategory';

const TagList = memo<{ category?: PluginCategory; showCategory?: boolean; tags: string[] }>(
  ({ tags, category, showCategory }) => {
    const categoryItem = useCategoryItem(category, 12);
    return (
      <Flexbox gap={6} horizontal style={{ flexWrap: 'wrap' }}>
        {showCategory && categoryItem ? (
          <Link href={urlJoin('/discover/plugins', categoryItem.key)}>
            <Tag icon={categoryItem.icon} style={{ margin: 0 }}>
              {categoryItem.label}
            </Tag>
          </Link>
        ) : (
          tags
            .slice(0, 4)
            .filter(Boolean)
            .map((tag: string, index) => {
              const url = qs.stringifyUrl({
                query: { q: tag },
                url: '/discover/search/plugins',
              });
              return (
                <Link href={url} key={index}>
                  <Tag style={{ margin: 0 }}>{startCase(tag).trim()}</Tag>
                </Link>
              );
            })
        )}
      </Flexbox>
    );
  },
);

export default TagList;
