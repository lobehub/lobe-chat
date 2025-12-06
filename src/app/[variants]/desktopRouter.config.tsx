'use client';

import { createBrowserRouter, redirect } from 'react-router-dom';

import Loading from '@/components/Loading/BrandTextLoading';
import { ErrorBoundary, dynamicElement } from '@/utils/router';

import DesktopChatLayout from './(main)/chat/_layout';
import DesktopHome from './(main)/home';
import DesktopHomeLayout from './(main)/home/_layout';
import DesktopImageLayout from './(main)/image/_layout';
import DesktopMainLayout from './(main)/layouts';
import DesktopMemoryLayout from './(main)/memory/_layout';
import DesktopPageLayout from './(main)/page/_layout';
import {
  agentIdLoader,
  idLoader,
  providerIdLoader,
  settingsTabLoader,
  slugLoader,
} from './loaders/routeParams';

// Create desktop router configuration
export const createDesktopRouter = () =>
  createBrowserRouter([
    {
      HydrateFallback: () => <Loading debugId="Desktop Router Hydration" />,
      children: [
        // Chat routes
        {
          children: [
            {
              index: true,
              loader: () => redirect('/', { status: 302 }),
            },
            {
              children: [
                {
                  element: dynamicElement(() => import('./(main)/chat'), 'Desktop > Chat'),
                  index: true,
                },
                {
                  element: dynamicElement(
                    () => import('./(main)/chat/profile'),
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
                        () =>
                          import('./(main)/discover/(list)/assistant').then(
                            (m) => m.DesktopAssistantPage,
                          ),
                        'Desktop > Discover > List > Assistant',
                      ),
                      index: true,
                    },
                  ],
                  element: dynamicElement(
                    () => import('./(main)/discover/(list)/assistant/_layout/Desktop'),
                    'Desktop > Discover > List > Assistant > Layout',
                  ),
                  path: 'assistant',
                },
                {
                  children: [
                    {
                      element: dynamicElement(
                        () =>
                          import('./(main)/discover/(list)/model').then((m) => m.DesktopModelPage),
                        'Desktop > Discover > List > Model',
                      ),
                      index: true,
                    },
                  ],
                  element: dynamicElement(
                    () => import('./(main)/discover/(list)/model/_layout/Desktop'),
                    'Desktop > Discover > List > Model > Layout',
                  ),
                  path: 'model',
                },
                {
                  element: dynamicElement(
                    () =>
                      import('./(main)/discover/(list)/provider').then(
                        (m) => m.DesktopProviderPage,
                      ),
                    'Desktop > Discover > List > Provider',
                  ),
                  path: 'provider',
                },
                {
                  children: [
                    {
                      element: dynamicElement(
                        () => import('./(main)/discover/(list)/mcp').then((m) => m.DesktopMcpPage),
                        'Desktop > Discover > List > MCP',
                      ),
                      index: true,
                    },
                  ],
                  element: dynamicElement(
                    () => import('./(main)/discover/(list)/mcp/_layout/Desktop'),
                    'Desktop > Discover > List > MCP > Layout',
                  ),
                  path: 'mcp',
                },
                {
                  element: dynamicElement(
                    () => import('./(main)/discover/(list)/(home)').then((m) => m.DesktopHomePage),
                    'Desktop > Discover > List > Home',
                  ),
                  index: true,
                },
              ],
              element: dynamicElement(
                () => import('./(main)/discover/(list)/_layout/Desktop'),
                'Desktop > Discover > List > Layout',
              ),
            },
            // Detail routes (with DetailLayout)
            {
              children: [
                {
                  element: dynamicElement(
                    () =>
                      import('./(main)/discover/(detail)/assistant').then(
                        (m) => m.DesktopDiscoverAssistantDetailPage,
                      ),
                    'Desktop > Discover > Detail > Assistant',
                  ),
                  loader: slugLoader,
                  path: 'assistant/:slug',
                },
                {
                  element: dynamicElement(
                    () =>
                      import('./(main)/discover/(detail)/model').then((m) => m.DesktopModelPage),
                    'Desktop > Discover > Detail > Model',
                  ),
                  loader: slugLoader,
                  path: 'model/:slug',
                },
                {
                  element: dynamicElement(
                    () =>
                      import('./(main)/discover/(detail)/provider').then(
                        (m) => m.DesktopProviderPage,
                      ),
                    'Desktop > Discover > Detail > Provider',
                  ),
                  loader: slugLoader,
                  path: 'provider/:slug',
                },
                {
                  element: dynamicElement(
                    () => import('./(main)/discover/(detail)/mcp').then((m) => m.DesktopMcpPage),
                    'Desktop > Discover > Detail > MCP',
                  ),
                  loader: slugLoader,
                  path: 'mcp/:slug',
                },
              ],
              element: dynamicElement(
                () => import('./(main)/discover/(detail)/_layout/Desktop'),
                'Desktop > Discover > Detail > Layout',
              ),
            },
          ],
          element: dynamicElement(
            () => import('./(main)/discover/_layout/Desktop'),
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
                    () => import('./(main)/resource/(home)'),
                    'Desktop > Resource > Home',
                  ),
                  index: true,
                },
              ],
              element: dynamicElement(
                () => import('./(main)/resource/(home)/_layout'),
                'Desktop > Resource > Home > Layout',
              ),
            },
            // Library routes (knowledge base detail)
            {
              children: [
                {
                  element: dynamicElement(
                    () => import('./(main)/resource/library'),
                    'Desktop > Resource > Library',
                  ),
                  index: true,
                  loader: idLoader,
                },
                {
                  element: dynamicElement(
                    () => import('./(main)/resource/library/[slug]'),
                    'Desktop > Resource > Library > Slug',
                  ),
                  loader: idLoader,
                  path: ':slug',
                },
              ],

              element: dynamicElement(
                () => import('./(main)/resource/library/_layout'),
                'Desktop > Resource > Library > Layout',
              ),
              path: 'library/:id',
            },
          ],
          element: dynamicElement(
            () => import('./(main)/resource/_layout'),
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
                    () => import('./(main)/settings/provider').then((m) => m.ProviderDetailPage),
                    'Desktop > Settings > Provider > Detail',
                  ),
                  loader: providerIdLoader,
                  path: ':providerId',
                },
              ],
              element: dynamicElement(
                () => import('./(main)/settings/provider').then((m) => m.ProviderLayout),
                'Desktop > Settings > Provider > Layout',
              ),
              path: 'provider',
            },
            // Other settings tabs
            {
              element: dynamicElement(
                () => import('./(main)/settings'),
                'Desktop > Settings > Tab',
              ),
              loader: settingsTabLoader,
              path: ':tab',
            },
          ],
          element: dynamicElement(
            () => import('./(main)/settings/_layout'),
            'Desktop > Settings > Layout',
          ),
          errorElement: <ErrorBoundary resetPath="/settings" />,
          path: 'settings',
        },

        // Memory routes
        {
          children: [
            {
              element: dynamicElement(() => import('./(main)/memory'), 'Desktop > Memory'),
              index: true,
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
              element: dynamicElement(() => import('./(main)/image'), 'Desktop > Image'),
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
              element: dynamicElement(() => import('./(main)/page'), 'Desktop > Page'),
              index: true,
            },
            {
              element: dynamicElement(
                () => import('./(main)/page/[id]'),
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
