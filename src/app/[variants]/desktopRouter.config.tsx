'use client';

import { createBrowserRouter, redirect } from 'react-router-dom';

import { ErrorBoundary, dynamicElement } from '@/utils/router';

import DesktopMainLayout from './(main)/layouts/desktop';
import { idLoader, slugLoader } from './loaders/routeParams';

// Create desktop router configuration
export const createDesktopRouter = () =>
  createBrowserRouter([
    {
      children: [
        // Chat routes
        {
          children: [
            {
              element: dynamicElement(() => import('./(main)/chat/index')),
              index: true,
            },
            {
              element: dynamicElement(() => import('./(main)/chat/index')),
              path: '*',
            },
          ],
          element: dynamicElement(() => import('./(main)/chat/_layout')),
          errorElement: <ErrorBoundary resetPath="/chat" />,
          path: 'chat',
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
                        import('./(main)/discover/(list)/assistant/index').then(
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
                        import('./(main)/discover/(list)/model/index').then(
                          (m) => m.DesktopModelPage,
                        ),
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
                    import('./(main)/discover/(list)/provider/index').then(
                      (m) => m.DesktopProviderPage,
                    ),
                  ),
                  path: 'provider',
                },
                {
                  children: [
                    {
                      element: dynamicElement(() =>
                        import('./(main)/discover/(list)/mcp/index').then((m) => m.DesktopMcpPage),
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
                    import('./(main)/discover/(list)/(home)/index').then((m) => m.DesktopHomePage),
                  ),
                  index: true,
                },
              ],
              element: dynamicElement(
                () => import('./(main)/discover/(list)/_layout/Desktop/index'),
              ),
            },
            // Detail routes (with DetailLayout)
            {
              children: [
                {
                  element: dynamicElement(() =>
                    import('./(main)/discover/(detail)/assistant/index').then(
                      (m) => m.DesktopDiscoverAssistantDetailPage,
                    ),
                  ),
                  loader: slugLoader,
                  path: 'assistant/:slug',
                },
                {
                  element: dynamicElement(() =>
                    import('./(main)/discover/(detail)/model/index').then(
                      (m) => m.DesktopModelPage,
                    ),
                  ),
                  loader: slugLoader,
                  path: 'model/:slug',
                },
                {
                  element: dynamicElement(() =>
                    import('./(main)/discover/(detail)/provider/index').then(
                      (m) => m.DesktopProviderPage,
                    ),
                  ),
                  loader: slugLoader,
                  path: 'provider/:slug',
                },
                {
                  element: dynamicElement(() =>
                    import('./(main)/discover/(detail)/mcp/index').then((m) => m.DesktopMcpPage),
                  ),
                  loader: slugLoader,
                  path: 'mcp/:slug',
                },
              ],
              element: dynamicElement(() => import('./(main)/discover/(detail)/_layout/Desktop')),
            },
          ],
          element: dynamicElement(() => import('./(main)/discover/_layout/Desktop/index')),
          errorElement: <ErrorBoundary resetPath="/discover" />,
          path: 'discover',
        },

        // Knowledge routes
        {
          children: [
            {
              element: dynamicElement(() => import('./(main)/knowledge/routes/KnowledgeHome')),
              index: true,
            },
            {
              element: dynamicElement(() => import('./(main)/knowledge/routes/KnowledgeHome')),
              loader: idLoader,
              path: ':id',
            },
            {
              element: dynamicElement(() => import('./(main)/knowledge/routes/KnowledgeBasesList')),
              path: 'bases',
            },
            {
              element: dynamicElement(
                () => import('./(main)/knowledge/routes/KnowledgeBaseDetail'),
              ),
              loader: idLoader,
              path: 'bases/:id',
            },
            {
              element: dynamicElement(
                () => import('./(main)/knowledge/routes/KnowledgeBaseDetail'),
              ),
              loader: idLoader,
              path: '*',
            },
          ],
          element: dynamicElement(() => import('./(main)/knowledge/_layout/Desktop')),
          errorElement: <ErrorBoundary resetPath="/knowledge" />,
          path: 'knowledge',
        },

        // Settings routes
        {
          children: [
            {
              element: dynamicElement(() => import('./(main)/settings/_layout/Desktop')),
              index: true,
            },
          ],
          element: dynamicElement(() => import('./(main)/settings/_layout/DesktopWrapper')),
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
          element: dynamicElement(() => import('./(main)/image/_layout/DesktopWrapper')),
          errorElement: <ErrorBoundary resetPath="/image" />,
          path: 'image',
        },

        // Labs routes
        {
          element: dynamicElement(() => import('./(main)/labs')),
          path: 'labs',
        },

        // Profile routes
        {
          children: [
            {
              element: dynamicElement(() => import('./(main)/profile/(home)/desktop')),
              index: true,
            },
            {
              element: dynamicElement(() => import('./(main)/profile/apikey/index')),
              path: 'apikey',
            },
            {
              element: dynamicElement(() =>
                import('./(main)/profile/security/index').then((m) => m.DesktopProfileSecurityPage),
              ),
              path: 'security',
            },
            {
              element: dynamicElement(() =>
                import('./(main)/profile/stats/index').then((m) => m.DesktopProfileStatsPage),
              ),
              path: 'stats',
            },
            {
              element: dynamicElement(() =>
                import('./(main)/profile/usage/index').then((m) => m.DesktopProfileUsagePage),
              ),
              path: 'usage',
            },
          ],
          element: dynamicElement(() => import('./(main)/profile/_layout/DesktopWrapper')),
          errorElement: <ErrorBoundary resetPath="/profile" />,
          path: 'profile',
        },

        // changelog routes
        {
          children: [
            {
              element: dynamicElement(() =>
                import('./(main)/changelog/index').then((m) => m.DesktopPage),
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
          element: dynamicElement(() => import('./(main)/home')),
          index: true,
        },
        // Catch-all route
        {
          loader: () => redirect('/', { status: 302 }),
          path: '*',
        },
      ],
      element: <DesktopMainLayout />,
      errorElement: <ErrorBoundary resetPath="/chat" />,
      path: '/',
    },
  ]);
