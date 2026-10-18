import type { LoaderFunctionArgs } from 'react-router';

import { getActiveWorkspaceId } from '@/business/client/hooks/useActiveWorkspaceId';
import { useResourceManagerStore } from '@/features/ResourceManager/store';
import { parseWorkGalleryKey, type WorkGalleryKey } from '@/features/WorkGallery/const';
import { workspaceWorksParams } from '@/features/WorkGallery/hooks';
import { PRE_PAINT_HYDRATE_TIMEOUT, settleWithin } from '@/libs/replica/prePaint';
import { workActions } from '@/store/work';

/**
 * The Work gallery filter a resource URL paints: the dashboard's recent works
 * (`/resource`) and the gallery (`/resource/works?works=<key>`). Other
 * categories show no Works.
 */
export const galleryKeyOfUrl = (url: URL): WorkGalleryKey | null => {
  const segment = url.pathname.match(/\/resource(?:\/([^/]+))?\/?$/);
  if (!segment) return null;
  if (!segment[1]) return 'all';
  if (segment[1] !== 'works') return null;
  return parseWorkGalleryKey(url.searchParams.get('works')) ?? 'all';
};

/**
 * Seed the persisted Work gallery head page for the filter the URL encodes.
 *
 * Route loaders run before React commits the route: the only point where the
 * persisted list (an async read) can land before the page paints its loading
 * skeleton. The visibility is the persisted Private / Workspace mode the
 * resource sidebar restores for this workspace; the loader restores it into
 * the ResourceManager store first, so the page's first render reads the same
 * mode (and the same replica entry) instead of the store default.
 */
export const worksLoader = async ({ request }: LoaderFunctionArgs): Promise<null> => {
  const galleryKey = galleryKeyOfUrl(new URL(request.url));
  if (!galleryKey) return null;

  const workspaceId = getActiveWorkspaceId();
  useResourceManagerStore.getState().hydrateListVisibility(workspaceId ?? undefined);
  const { listVisibility } = useResourceManagerStore.getState();

  await settleWithin(
    workActions.preHydrateWorkspaceWorks(
      workspaceWorksParams(galleryKey, workspaceId, listVisibility),
    ),
    PRE_PAINT_HYDRATE_TIMEOUT,
  );

  return null;
};
