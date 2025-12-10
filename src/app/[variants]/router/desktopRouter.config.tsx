'use client';

import { isDesktop } from '@lobechat/const';
import { createBrowserRouter, createHashRouter, redirect } from 'react-router-dom';

import Loading from '@/components/Loading/BrandTextLoading';
import { ErrorBoundary, dynamicElement } from '@/utils/router';

import DesktopMainLayout from '../(main)/_layout';
import DesktopChatLayout from '../(main)/chat/_layout';
import DesktopGroupLayout from '../(main)/group/_layout';
import DesktopHome from '../(main)/home';
import DesktopHomeLayout from '../(main)/home/_layout';
import DesktopImageLayout from '../(main)/image/_layout';
import DesktopMemoryLayout from '../(main)/memory/_layout';
import DesktopPageLayout from '../(main)/page/_layout';
import {
  agentIdLoader,
  groupIdLoader,
  idLoader,
  providerIdLoader,
  settingsTabLoader,
  slugLoader,
} from '../loaders/routeParams';

// Create desktop router configuration
export const createDesktopRouter = () => {
  const createRouter = isDesktop ? createHashRouter : createBrowserRouter;

  return createRouter([
    {
      HydrateFallback: () => <Loading debugId="Desktop Router Hydration" />,
      children: [
        // Chat routes (agent)
        {
          children: [
            {
              index: true,
              loader: () => redirect('/', { status: 302 }),
            },
            {
              children: [
                {
                  element: dynamicElement(() => import('../(main)/chat'), 'Desktop > Chat'),
                  index: true,
                },
                {
                  element: dynamicElement(
                    () => import('../(main)/chat/profile'),
                    'Desktop > Chat > Profile',
                  ),
                  path: 'profile',
                },
              ],
              element: <DesktopChatLayout />,
              errorElement: <ErrorBoundary resetPath="/agent" />,
              loader: agentIdLoader,
              path: ':aid',
            },
          ],
          path: 'agent',
        },

        // Group chat routes
        {
          children: [
            {
              index: true,
              loader: () => redirect('/', { status: 302 }),
            },
            {
              children: [
                {
                  element: dynamicElement(() => import('../(main)/group'), 'Desktop > Agent Group'),
                  index: true,
                },
                {
                  element: dynamicElement(
                    () => import('../(main)/group/profile'),
                    'Desktop > Agent Group > Profile',
                  ),
                  path: 'profile',
                },
              ],
              element: <DesktopGroupLayout />,
              errorElement: <ErrorBoundary resetPath="/group" />,
              loader: groupIdLoader,
              path: ':gid',
            },
          ],
          path: 'group',
        },

        // Discover routes with nested structure
        {
          children: [
            // List routes (with ListLayout)
            {
              children: [
                {
                  children: [
                    {
                      element: dynamicElement(
                        () => import('../(main)/discover/(list)/assistant'),
                        'Desktop > Discover > List > Assistant',
                      ),
                      index: true,
                    },
                  ],
                  element: dynamicElement(
                    () => import('../(main)/discover/(list)/assistant/_layout'),
                    'Desktop > Discover > List > Assistant > Layout',
                  ),
                  path: 'assistant',
                },
                {
                  children: [
                    {
                      element: dynamicElement(
                        () => import('../(main)/discover/(list)/model'),
                        'Desktop > Discover > List > Model',
                      ),
                      index: true,
                    },
                  ],
                  element: dynamicElement(
                    () => import('../(main)/discover/(list)/model/_layout'),
                    'Desktop > Discover > List > Model > Layout',
                  ),
                  path: 'model',
                },
                {
                  element: dynamicElement(
                    () => import('../(main)/discover/(list)/provider'),
                    'Desktop > Discover > List > Provider',
                  ),
                  path: 'provider',
                },
                {
                  children: [
                    {
                      element: dynamicElement(
                        () => import('../(main)/discover/(list)/mcp'),
                        'Desktop > Discover > List > MCP',
                      ),
                      index: true,
                    },
                  ],
                  element: dynamicElement(
                    () => import('../(main)/discover/(list)/mcp/_layout'),
                    'Desktop > Discover > List > MCP > Layout',
                  ),
                  path: 'mcp',
                },
                {
                  element: dynamicElement(
                    () => import('../(main)/discover/(list)/(home)'),
                    'Desktop > Discover > List > Home',
                  ),
                  index: true,
                },
              ],
              element: dynamicElement(
                () => import('../(main)/discover/(list)/_layout'),
                'Desktop > Discover > List > Layout',
              ),
            },
            // Detail routes (with DetailLayout)
            {
              children: [
                {
                  element: dynamicElement(
                    () => import('../(main)/discover/(detail)/assistant'),
                    'Desktop > Discover > Detail > Assistant',
                  ),
                  loader: slugLoader,
                  path: 'assistant/:slug',
                },
                {
                  element: dynamicElement(
                    () => import('../(main)/discover/(detail)/model'),
                    'Desktop > Discover > Detail > Model',
                  ),
                  loader: slugLoader,
                  path: 'model/:slug',
                },
                {
                  element: dynamicElement(
                    () => import('../(main)/discover/(detail)/provider'),
                    'Desktop > Discover > Detail > Provider',
                  ),
                  loader: slugLoader,
                  path: 'provider/:slug',
                },
                {
                  element: dynamicElement(
                    () => import('../(main)/discover/(detail)/mcp'),
                    'Desktop > Discover > Detail > MCP',
                  ),
                  loader: slugLoader,
                  path: 'mcp/:slug',
                },
                {
                  element: dynamicElement(
                    () => import('../(main)/discover/(detail)/user'),
                    'Desktop > Discover > Detail > User',
                  ),
                  loader: slugLoader,
                  path: 'user/:slug',
                },
              ],
              element: dynamicElement(
                () => import('../(main)/discover/(detail)/_layout'),
                'Desktop > Discover > Detail > Layout',
              ),
            },
          ],
          element: dynamicElement(
            () => import('../(main)/discover/_layout'),
            'Desktop > Discover > Layout',
          ),
          errorElement: <ErrorBoundary resetPath="/discover" />,
          path: 'discover',
        },

        // Resource routes
        {
          children: [
            // Home routes (resource list)
            {
              children: [
                {
                  element: dynamicElement(
                    () => import('../(main)/resource/(home)'),
                    'Desktop > Resource > Home',
                  ),
                  index: true,
                },
              ],
              element: dynamicElement(
                () => import('../(main)/resource/(home)/_layout'),
                'Desktop > Resource > Home > Layout',
              ),
            },
            // Library routes (knowledge base detail)
            {
              children: [
                {
                  element: dynamicElement(
                    () => import('../(main)/resource/library'),
                    'Desktop > Resource > Library',
                  ),
                  index: true,
                  loader: idLoader,
                },
                {
                  element: dynamicElement(
                    () => import('../(main)/resource/library/[slug]'),
                    'Desktop > Resource > Library > Slug',
                  ),
                  loader: idLoader,
                  path: ':slug',
                },
              ],

              element: dynamicElement(
                () => import('../(main)/resource/library/_layout'),
                'Desktop > Resource > Library > Layout',
              ),
              path: 'library/:id',
            },
          ],
          element: dynamicElement(
            () => import('../(main)/resource/_layout'),
            'Desktop > Resource > Layout',
          ),
          errorElement: <ErrorBoundary resetPath="/resource" />,
          path: 'resource',
        },

        // Settings routes
        {
          children: [
            {
              index: true,
              loader: () => redirect('/settings/profile', { status: 302 }),
            },
            // Provider routes with nested structure
            {
              children: [
                {
                  index: true,
                  loader: () => redirect('/settings/provider/all', { status: 302 }),
                },
                {
                  element: dynamicElement(
                    () => import('../(main)/settings/provider').then((m) => m.ProviderDetailPage),
                    'Desktop > Settings > Provider > Detail',
                  ),
                  loader: providerIdLoader,
                  path: ':providerId',
                },
              ],
              element: dynamicElement(
                () => import('../(main)/settings/provider').then((m) => m.ProviderLayout),
                'Desktop > Settings > Provider > Layout',
              ),
              path: 'provider',
            },
            // Other settings tabs
            {
              element: dynamicElement(
                () => import('../(main)/settings'),
                'Desktop > Settings > Tab',
              ),
              loader: settingsTabLoader,
              path: ':tab',
            },
          ],
          element: dynamicElement(
            () => import('../(main)/settings/_layout'),
            'Desktop > Settings > Layout',
          ),
          errorElement: <ErrorBoundary resetPath="/settings" />,
          path: 'settings',
        },

        // Memory routes
        {
          children: [
            {
              element: dynamicElement(
                () => import('../(main)/memory/(home)'),
                'Desktop > Memory > Home',
              ),
              index: true,
            },
            {
              element: dynamicElement(
                () => import('../(main)/memory/identities'),
                'Desktop > Memory > Identities',
              ),
              path: 'identities',
            },
            {
              element: dynamicElement(
                () => import('../(main)/memory/contexts'),
                'Desktop > Memory > Contexts',
              ),
              path: 'contexts',
            },
            {
              element: dynamicElement(
                () => import('../(main)/memory/preferences'),
                'Desktop > Memory > Preferences',
              ),
              path: 'preferences',
            },
            {
              element: dynamicElement(
                () => import('../(main)/memory/experiences'),
                'Desktop > Memory > Experiences',
              ),
              path: 'experiences',
            },
          ],
          element: <DesktopMemoryLayout />,
          errorElement: <ErrorBoundary resetPath="/memory" />,
          path: 'memory',
        },

        // Image routes
        {
          children: [
            {
              element: dynamicElement(() => import('../(main)/image'), 'Desktop > Image'),
              index: true,
            },
          ],
          element: <DesktopImageLayout />,
          errorElement: <ErrorBoundary resetPath="/image" />,
          path: 'image',
        },

        // Pages routes
        {
          children: [
            {
              element: dynamicElement(() => import('../(main)/page'), 'Desktop > Page'),
              index: true,
            },
            {
              element: dynamicElement(
                () => import('../(main)/page/[id]'),
                'Desktop > Page > Detail',
              ),
              loader: idLoader,
              path: ':id',
            },
          ],
          element: <DesktopPageLayout />,
          errorElement: <ErrorBoundary resetPath="/page" />,
          path: 'page',
        },

        // Default route - home page
        {
          children: [
            {
              element: <DesktopHome />,
              index: true,
            },
          ],
          element: <DesktopHomeLayout />,
        },
        // Catch-all route
        {
          loader: () => redirect('/', { status: 302 }),
          // TODO: Need update to NotFoundPage
          // element: <NotFoundPage />,
          path: '*',
        },
      ],
      element: <DesktopMainLayout />,
      errorElement: <ErrorBoundary resetPath="/" />,
      path: '/',
    },
  ]);
};
