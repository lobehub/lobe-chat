import {
  FilePenIcon,
  FilesIcon,
  FileText,
  ImageIcon,
  LayoutPanelTopIcon,
  LibraryBigIcon,
  Mic2,
  SquarePlay,
} from 'lucide-react';
import type { RouteObject } from 'react-router';

import { BusinessResourceRoutes } from '@/business/client/BusinessDesktopRoutes';
import ResourceHomeSkeleton from '@/components/Skeleton/ResourceHome';
import { routeMeta } from '@/spa/router/routeMeta';
import { worksLoader } from '@/spa/router/worksLoader';
import { dynamicElement } from '@/utils/router';

const resourceCategoryRoutes: RouteObject[] = [
  { icon: LayoutPanelTopIcon, path: 'all', titleKey: 'navigation.resourceAll' },
  { icon: FileText, path: 'documents', titleKey: 'navigation.resourceDocuments' },
  { icon: ImageIcon, path: 'images', titleKey: 'navigation.resourceImages' },
  { icon: SquarePlay, path: 'videos', titleKey: 'navigation.resourceVideos' },
  { icon: Mic2, path: 'audios', titleKey: 'navigation.resourceAudios' },
  { icon: FilesIcon, path: 'files', titleKey: 'navigation.resourceFiles' },
].map(({ icon, path, titleKey }) => ({
  element: dynamicElement(
    () => import('@/routes/(main)/resource/(home)'),
    `Desktop > Resource > Home > ${path}`,
    { preloadId: 'resource' },
  ),
  handle: { meta: routeMeta({ icon, titleKey }) },
  path,
}));

/** Children of the resource home layout: the dashboard, the categories and the Work gallery. */
export const resourceHomeRoutes: RouteObject[] = [
  {
    element: dynamicElement(
      () => import('@/routes/(main)/resource/(home)'),
      'Desktop > Resource > Home',
      { preloadId: 'resource' },
    ),
    handle: {
      meta: routeMeta({
        icon: LibraryBigIcon,
        Skeleton: ResourceHomeSkeleton,
        titleKey: 'navigation.resources',
      }),
    },
    index: true,
    // Seed the recent works from storage before the dashboard paints.
    loader: worksLoader,
  },
  ...BusinessResourceRoutes,
  ...resourceCategoryRoutes,
  // /resource/page needs a static segment: the dynamic `:category`
  // ties with the workspace mirror `/:workspaceSlug/page` on route
  // score, and the workspace tree would swallow it into a slug 404.
  {
    element: dynamicElement(
      () => import('@/routes/(main)/resource/(home)'),
      'Desktop > Resource > Home > Pages',
      { preloadId: 'resource' },
    ),
    handle: {
      meta: routeMeta({ icon: FilePenIcon, titleKey: 'navigation.resourcePages' }),
    },
    path: 'page',
  },
  // Category views share the home page: /resource/documents, /resource/images, …
  {
    element: dynamicElement(
      () => import('@/routes/(main)/resource/(home)'),
      'Desktop > Resource > Home > Category',
      { preloadId: 'resource' },
    ),
    handle: {
      meta: routeMeta({ icon: LibraryBigIcon, titleKey: 'navigation.resources' }),
    },
    // /resource/works: seed the gallery's head page before it paints.
    loader: worksLoader,
    path: ':category',
  },
];
