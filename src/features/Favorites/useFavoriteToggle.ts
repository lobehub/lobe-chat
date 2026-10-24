import type { AddFavoriteParams, FavoriteType } from '@lobechat/types';
import { toast } from '@lobehub/ui';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useHomeStore } from '@/store/home';
import { favoriteSelectors } from '@/store/home/selectors';

import { useFetchFavorites } from './useFetchFavorites';

export interface FavoriteTarget {
  /** Emoji or avatar URL of the target; omitted renders the type icon. */
  icon?: string | null;
  /** In-app link without the workspace slug; `useCurrentFavoritePath` gives the open page's. */
  path: string;
  targetId: string;
  title: string;
  type: FavoriteType;
}

/**
 * Favorite state and toggle for one target. While the target is favorited
 * and mounted, a renamed title, new icon or moved link is written back to the
 * favorite so the sidebar row does not go stale.
 */
export const useFavoriteToggle = (target: FavoriteTarget | undefined) => {
  const { t } = useTranslation('common');
  useFetchFavorites();

  const type = target?.type;
  const targetId = target?.targetId;
  const isFavorite = useHomeStore((s) =>
    type && targetId ? favoriteSelectors.isFavorite(type, targetId)(s) : false,
  );
  const [toggleFavorite, syncFavoriteSnapshot] = useHomeStore((s) => [
    s.toggleFavorite,
    s.syncFavoriteSnapshot,
  ]);

  const title = target?.title;
  const icon = target?.icon;
  const path = target?.path;
  useEffect(() => {
    if (!isFavorite || !type || !targetId || !title) return;
    syncFavoriteSnapshot(type, targetId, { icon, path, title }).catch((error) => {
      console.error('[favorite] failed to refresh the snapshot', error);
    });
  }, [isFavorite, type, targetId, title, icon, path, syncFavoriteSnapshot]);

  const toggle = useCallback(async () => {
    if (!target) return;
    const params: AddFavoriteParams = {
      icon: target.icon ?? null,
      path: target.path,
      targetId: target.targetId,
      title: target.title,
      type: target.type,
    };
    try {
      await toggleFavorite(params);
    } catch (error) {
      console.error('[favorite] toggle failed', error);
      toast.error(t('favorite.updateError'));
    }
  }, [t, target, toggleFavorite]);

  return { isFavorite, toggle };
};
