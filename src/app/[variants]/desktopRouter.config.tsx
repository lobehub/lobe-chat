'use client';

import { createBrowserRouter, redirect } from 'react-router-dom';

import Loading from '@/components/Loading/BrandTextLoading';
import { ErrorBoundary, dynamicElement } from '@/utils/router';

import DesktopMainLayout from './(main)/layouts';
import { agentIdLoader, idLoader, slugLoader } from './loaders/routeParams';

// Create desktop router configuration
export const createDesktopRouter = () =>
  createBrowserRouter([
    {
      HydrateFallback: Loading,
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
                  element: dynamicElement(() => import('./(main)/chat')),
                  index: true,
                },
                {
                  element: dynamicElement(() => import('./(main)/chat/profile')),
                  path: 'profile',
                },
              ],
              element: dynamicElement(() => import('./(main)/chat/_layout')),
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
                      element: dynamicElement(() =>
                        import('./(main)/discover/(list)/assistant').then(
                          (m) => m.DesktopAssistantPage,
                        ),
                      ),
                      index: true,
                    },
                  ],
                  element: dynamicElement(
                    () => import('./(main)/discover/(list)/assistant/_layout/Desktop'),
                  ),
                  path: 'assistant',
                },
                {
                  children: [
                    {
                      element: dynamicElement(() =>
                        import('./(main)/discover/(list)/model').then((m) => m.DesktopModelPage),
                      ),
                      index: true,
                    },
                  ],
                  element: dynamicElement(
                    () => import('./(main)/discover/(list)/model/_layout/Desktop'),
                  ),
                  path: 'model',
                },
                {
                  element: dynamicElement(() =>
                    import('./(main)/discover/(list)/provider').then((m) => m.DesktopProviderPage),
                  ),
                  path: 'provider',
                },
                {
                  children: [
                    {
                      element: dynamicElement(() =>
                        import('./(main)/discover/(list)/mcp').then((m) => m.DesktopMcpPage),
                      ),
                      index: true,
                    },
                  ],
                  element: dynamicElement(
                    () => import('./(main)/discover/(list)/mcp/_layout/Desktop'),
                  ),
                  path: 'mcp',
                },
                {
                  element: dynamicElement(() =>
                    import('./(main)/discover/(list)/(home)').then((m) => m.DesktopHomePage),
                  ),
                  index: true,
                },
              ],
              element: dynamicElement(() => import('./(main)/discover/(list)/_layout/Desktop')),
            },
            // Detail routes (with DetailLayout)
            {
              children: [
                {
                  element: dynamicElement(() =>
                    import('./(main)/discover/(detail)/assistant').then(
                      (m) => m.DesktopDiscoverAssistantDetailPage,
                    ),
                  ),
                  loader: slugLoader,
                  path: 'assistant/:slug',
                },
                {
                  element: dynamicElement(() =>
                    import('./(main)/discover/(detail)/model').then((m) => m.DesktopModelPage),
                  ),
                  loader: slugLoader,
                  path: 'model/:slug',
                },
                {
                  element: dynamicElement(() =>
                    import('./(main)/discover/(detail)/provider').then(
                      (m) => m.DesktopProviderPage,
                    ),
                  ),
                  loader: slugLoader,
                  path: 'provider/:slug',
                },
                {
                  element: dynamicElement(() =>
                    import('./(main)/discover/(detail)/mcp').then((m) => m.DesktopMcpPage),
                  ),
                  loader: slugLoader,
                  path: 'mcp/:slug',
                },
              ],
              element: dynamicElement(() => import('./(main)/discover/(detail)/_layout/Desktop')),
            },
          ],
          element: dynamicElement(() => import('./(main)/discover/_layout/Desktop')),
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
                  element: dynamicElement(() => import('./(main)/resource/(home)')),
                  index: true,
                },
              ],
              element: dynamicElement(() => import('./(main)/resource/(home)/_layout')),
            },
            // Library routes (knowledge base detail)
            {
              children: [
                {
                  element: dynamicElement(() => import('./(main)/resource/library')),
                  index: true,
                  loader: idLoader,
                },
                {
                  element: dynamicElement(() => import('./(main)/resource/library/[slug]')),
                  loader: idLoader,
                  path: ':slug',
                },
              ],

              element: dynamicElement(() => import('./(main)/resource/library/_layout')),
              path: 'library/:id',
            },
          ],
          element: dynamicElement(() => import('./(main)/resource/_layout')),
          errorElement: <ErrorBoundary resetPath="/resource" />,
          path: 'resource',
        },

        // Settings routes
        {
          children: [
            {
              element: dynamicElement(() => import('./(main)/settings')),
              index: true,
            },
          ],
          element: dynamicElement(() => import('./(main)/settings/_layout')),
          errorElement: <ErrorBoundary resetPath="/settings" />,
          path: 'settings',
        },

        // Image routes
        {
          children: [
            {
              element: dynamicElement(() => import('./(main)/image')),
              index: true,
            },
          ],
          element: dynamicElement(() => import('./(main)/image/_layout')),
          errorElement: <ErrorBoundary resetPath="/image" />,
          path: 'image',
        },

        // Pages routes
        {
          children: [
            {
              element: dynamicElement(() => import('./(main)/page')),
              index: true,
            },
            {
              element: dynamicElement(() => import('./(main)/page/[id]')),
              loader: idLoader,
              path: ':id',
            },
          ],
          element: dynamicElement(() => import('./(main)/page/_layout')),
          errorElement: <ErrorBoundary resetPath="/page" />,
          path: 'page',
        },

        // Labs routes
        {
          element: dynamicElement(() => import('./(main)/labs')),
          path: 'labs',
        },

        // changelog routes
        {
          children: [
            {
              element: dynamicElement(() =>
                import('./(main)/changelog').then((m) => m.DesktopPage),
              ),
              index: true,
            },
          ],
          element: dynamicElement(() => import('./(main)/changelog/_layout/Desktop')),
          errorElement: <ErrorBoundary resetPath="/changelog" />,
          path: 'changelog',
        },
        // Default route - redirect to chat
        {
          children: [
            {
              element: dynamicElement(() => import('./(main)/home')),
              index: true,
            },
          ],
          element: dynamicElement(() => import('./(main)/home/_layout')),
        },
        // Catch-all route
        {
          loader: () => redirect('/', { status: 302 }),
          path: '*',
        },
      ],
      element: <DesktopMainLayout />,
      errorElement: <ErrorBoundary resetPath="/" />,
      path: '/',
    },
  ]);
