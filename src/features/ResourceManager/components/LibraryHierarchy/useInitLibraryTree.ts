import { useLayoutEffect } from 'react';
import { useParams } from 'react-router';

import { useResourceManagerStore } from '@/features/ResourceManager/store';
import { useTreeStore } from '@/store/tree';

/**
 * The library the sidebar tree shows, initialised before the first paint.
 *
 * The page segment copies the route's library into the ResourceManager store
 * only once its own (lazy) chunk mounts. The sidebar mounts with the layout, so
 * it reads the route first: waiting for the store kept the persisted tree behind
 * a skeleton for as long as the page took to load.
 *
 * `init` runs in a layout effect, so the tree it seeds from the persisted
 * snapshot is already in the first painted frame.
 */
export const useInitLibraryTree = (): string | undefined => {
  const { id: routeLibraryId } = useParams<{ id: string }>();
  const storeLibraryId = useResourceManagerStore((s) => s.libraryId);
  const init = useTreeStore((s) => s.init);
  const libraryId = routeLibraryId ?? storeLibraryId;

  useLayoutEffect(() => {
    if (!libraryId) return;
    init(libraryId);
  }, [libraryId, init]);

  return libraryId;
};
