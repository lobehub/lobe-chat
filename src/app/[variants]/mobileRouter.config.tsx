'use client';

import { createBrowserRouter, redirect } from 'react-router-dom';

import { ErrorBoundary, dynamicElement } from '@/utils/router';

import { MobileMainLayout } from './(main)/layouts/mobile';
import { idLoader, slugLoader } from './loaders/routeParams';

// Create mobile router configuration
export const createMobileRouter = () =>
  createBrowserRouter([
    {
      children: [
        // Chat routes
        {
          children: [
            {
              element: dynamicElement(() => import('./(main)/chat/(mobile)')),
              index: true,
            },
            {
              element: dynamicElement(() => import('./(main)/chat/Settings')),
              path: 'settings',
            },
          ],
          element: dynamicElement(() => import('./(main)/chat/(mobile)/_layout/Mobile')),
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
                  element: dynamicElement(() =>
                    import('./(main)/discover/(list)/(home)/index').then((m) => m.MobileHomePage),
                  ),
                  index: true,
                },
                {
                  children: [
                    {
                      element: dynamicElement(() =>
                        import('./(main)/discover/(list)/assistant/index').then(
                          (m) => m.MobileAssistantPage,
                        ),
                      ),
                      path: 'assistant',
                    },
                  ],
                  element: dynamicElement(
                    () => import('./(main)/discover/(list)/assistant/_layout/Mobile'),
                  ),
                },
                {
                  children: [
                    {
                      element: dynamicElement(() =>
                        import('./(main)/discover/(list)/model/index').then(
                          (m) => m.MobileModelPage,
                        ),
                      ),
                      path: 'model',
                    },
                  ],
                  element: dynamicElement(
                    () => import('./(main)/discover/(list)/model/_layout/Mobile'),
                  ),
                },
                {
                  element: dynamicElement(() =>
                    import('./(main)/discover/(list)/provider/index').then(
                      (m) => m.MobileProviderPage,
                    ),
                  ),
                  path: 'provider',
                },
                {
                  children: [
                    {
                      element: dynamicElement(() =>
                        import('./(main)/discover/(list)/mcp/index').then((m) => m.MobileMcpPage),
                      ),
                      path: 'mcp',
                    },
                  ],
                  element: dynamicElement(
                    () => import('./(main)/discover/(list)/mcp/_layout/Mobile'),
                  ),
                },
              ],
              element: dynamicElement(
                () => import('./(main)/discover/(list)/_layout/Mobile/index'),
              ),
            },
            // Detail routes (with DetailLayout)
            {
              children: [
                {
                  element: dynamicElement(() =>
                    import('./(main)/discover/(detail)/assistant/index').then(
                      (m) => m.MobileDiscoverAssistantDetailPage,
                    ),
                  ),
                  loader: slugLoader,
                  path: 'assistant/:slug',
                },
                {
                  element: dynamicElement(() =>
                    import('./(main)/discover/(detail)/model/index').then((m) => m.MobileModelPage),
                  ),
                  loader: slugLoader,
                  path: 'model/:slug',
                },
                {
                  element: dynamicElement(() =>
                    import('./(main)/discover/(detail)/provider/index').then(
                      (m) => m.MobileProviderPage,
                    ),
                  ),
                  loader: slugLoader,
                  path: 'provider/:slug',
                },
                {
                  element: dynamicElement(() =>
                    import('./(main)/discover/(detail)/mcp/index').then((m) => m.MobileMcpPage),
                  ),
                  loader: slugLoader,
                  path: 'mcp/:slug',
                },
              ],
              element: dynamicElement(
                () => import('./(main)/discover/(detail)/_layout/Mobile/index'),
              ),
            },
          ],
          element: dynamicElement(() => import('./(main)/discover/_layout/Mobile/index')),
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
          ],
          element: dynamicElement(() => import('./(main)/knowledge/_layout/Mobile')),
          errorElement: <ErrorBoundary resetPath="/knowledge" />,
          path: 'knowledge',
        },

        // Settings routes
        {
          children: [
            {
              element: dynamicElement(() => import('./(main)/settings/_layout/Mobile')),
              index: true,
            },
          ],
          element: dynamicElement(() => import('./(main)/settings/_layout/MobileWrapper')),
          errorElement: <ErrorBoundary resetPath="/settings" />,
          path: 'settings',
        },

        // Image routes
        {
          children: [
            {
              element: dynamicElement(() => import('./(main)/image/ComingSoon')),
              index: true,
            },
          ],
          element: dynamicElement(() => import('./(main)/image/_layout/Mobile')),
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
              element: dynamicElement(() => import('./(main)/profile/(home)')),
              index: true,
            },
            {
              element: dynamicElement(() => import('./(main)/profile/apikey/index')),
              path: 'apikey',
            },
            {
              element: dynamicElement(() =>
                import('./(main)/profile/security').then((m) => m.MobileProfileSecurityPage),
              ),
              path: 'security',
            },
            {
              element: dynamicElement(() =>
                import('./(main)/profile/stats').then((m) => m.MobileProfileStatsPage),
              ),
              path: 'stats',
            },
          ],
          element: dynamicElement(() => import('./(main)/profile/_layout/Mobile')),
          errorElement: <ErrorBoundary resetPath="/profile" />,
          path: 'profile',
        },

        // Me routes (mobile personal center)
        {
          children: [
            {
              children: [
                {
                  element: dynamicElement(() => import('./(main)/(mobile)/me/(home)')),
                  index: true,
                },
              ],
              element: dynamicElement(() => import('./(main)/(mobile)/me/(home)/layout')),
            },
            {
              children: [
                {
                  element: dynamicElement(() => import('./(main)/(mobile)/me/profile')),
                  path: 'profile',
                },
              ],
              element: dynamicElement(() => import('./(main)/(mobile)/me/profile/layout')),
            },
            {
              children: [
                {
                  element: dynamicElement(() => import('./(main)/(mobile)/me/settings')),
                  path: 'settings',
                },
              ],
              element: dynamicElement(() => import('./(main)/(mobile)/me/settings/layout')),
            },
          ],
          errorElement: <ErrorBoundary resetPath="/me" />,
          path: 'me',
        },

        // changelog routes
        {
          children: [
            {
              element: dynamicElement(() =>
                import('./(main)/changelog/index').then((m) => m.MobilePage),
              ),
              index: true,
            },
          ],
          element: dynamicElement(() => import('./(main)/changelog/_layout/Mobile')),
          errorElement: <ErrorBoundary resetPath="/changelog" />,
          path: 'changelog',
        },

        // Default route - redirect to chat
        {
          index: true,
          loader: () => redirect('/agent', { status: 302 }),
        },

        // Catch-all route
        {
          loader: () => redirect('/agent', { status: 302 }),
          path: '*',
        },
      ],
      element: <MobileMainLayout />,
      errorElement: <ErrorBoundary resetPath="/chat" />,
      path: '/',
    },
  ]);
