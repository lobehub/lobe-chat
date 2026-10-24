'use client';

import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Text,
} from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFetchFavorites } from '@/features/Favorites';
import { useHomeStore } from '@/store/home';
import { favoriteSelectors } from '@/store/home/selectors';

import SortableFavoriteList from './SortableFavoriteList';

interface FavoritesProps {
  itemKey: string;
}

/**
 * Pages the member starred, in the order they arranged. The section only
 * appears once something is favorited: an empty one would be a heading with
 * nothing to act on, and the star on each page is the way in.
 */
const Favorites = memo<FavoritesProps>(({ itemKey }) => {
  const { t } = useTranslation('common');
  useFetchFavorites();
  const items = useHomeStore(favoriteSelectors.favorites);

  if (items.length === 0) return null;

  return (
    <AccordionItem value={itemKey}>
      <AccordionHeader>
        <AccordionTrigger style={{ paddingBlock: 4, paddingInline: '8px 4px' }}>
          <Text ellipsis fontSize={12} type="secondary" weight={500}>
            {t('favorite.section')}
          </Text>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>
        <SortableFavoriteList items={items} />
      </AccordionPanel>
    </AccordionItem>
  );
});

Favorites.displayName = 'Favorites';

export default Favorites;
