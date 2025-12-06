'use client';

import { createBrowserRouter, redirect } from 'react-router-dom';

import Loading from '@/components/Loading/BrandTextLoading';
import { ErrorBoundary, dynamicElement } from '@/utils/router';

import { MobileMainLayout } from './(main)/(mobile)/_layout';
import MobileMeHomeLayout from './(main)/(mobile)/me/(home)/layout';
import MobileMeProfileLayout from './(main)/(mobile)/me/profile/layout';
import MobileMeSettingsLayout from './(main)/(mobile)/me/settings/layout';
import MobileMemoryLayout from './(main)/memory/_layout';
import MobileSettingsLayout from './(main)/settings/(mobile)/_layout';
import { slugLoader } from './loaders/routeParams';

// Create mobile router configuration
export const createMobileRouter = () =>
  createBrowserRouter([
    {
      HydrateFallback: () => <Loading debugId="Mobile Router Hydration" />,
      children: [
        // Chat routes
        {
          children: [
            {
              element: dynamicElement(() => import('./(main)/chat/(mobile)'), 'Mobile > Chat'),
              index: true,
            },
            {
              element: dynamicElement(
                () => import('./(main)/chat/profile/Settings'),
                'Mobile > Chat > Settings',
              ),
              path: 'settings',
            },
          ],
          element: dynamicElement(
            () => import('./(main)/chat/(mobile)/_layout/Mobile'),
            'Mobile > Chat > Layout',
          ),
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
                  element: dynamicElement(
                    () =>
                      import('./(main)/discover/(list)/(home)/index').then((m) => m.MobileHomePage),
                    'Mobile > Discover > List > Home',
                  ),
                  index: true,
                },
                {
                  children: [
                    {
                      element: dynamicElement(
                        () =>
                          import('./(main)/discover/(list)/assistant/index').then(
                            (m) => m.MobileAssistantPage,
                          ),
                        'Mobile > Discover > List > Assistant',
                      ),
                      path: 'assistant',
                    },
                  ],
                  element: dynamicElement(
                    () => import('./(main)/discover/(list)/assistant/_layout/Mobile'),
                    'Mobile > Discover > List > Assistant > Layout',
                  ),
                },
                {
                  children: [
                    {
                      element: dynamicElement(
                        () =>
                          import('./(main)/discover/(list)/model/index').then(
                            (m) => m.MobileModelPage,
                          ),
                        'Mobile > Discover > List > Model',
                      ),
                      path: 'model',
                    },
                  ],
                  element: dynamicElement(
                    () => import('./(main)/discover/(list)/model/_layout/Mobile'),
                    'Mobile > Discover > List > Model > Layout',
                  ),
                },
                {
                  element: dynamicElement(
                    () =>
                      import('./(main)/discover/(list)/provider/index').then(
                        (m) => m.MobileProviderPage,
                      ),
                    'Mobile > Discover > List > Provider',
                  ),
                  path: 'provider',
                },
                {
                  children: [
                    {
                      element: dynamicElement(
                        () =>
                          import('./(main)/discover/(list)/mcp/index').then((m) => m.MobileMcpPage),
                        'Mobile > Discover > List > MCP',
                      ),
                      path: 'mcp',
                    },
                  ],
                  element: dynamicElement(
                    () => import('./(main)/discover/(list)/mcp/_layout/Mobile'),
                    'Mobile > Discover > List > MCP > Layout',
                  ),
                },
              ],
              element: dynamicElement(
                () => import('./(main)/discover/(list)/_layout/Mobile/index'),
                'Mobile > Discover > List > Layout',
              ),
            },
            // Detail routes (with DetailLayout)
            {
              children: [
                {
                  element: dynamicElement(
                    () =>
                      import('./(main)/discover/(detail)/assistant/index').then(
                        (m) => m.MobileDiscoverAssistantDetailPage,
                      ),
                    'Mobile > Discover > Detail > Assistant',
                  ),
                  loader: slugLoader,
                  path: 'assistant/:slug',
                },
                {
                  element: dynamicElement(
                    () =>
                      import('./(main)/discover/(detail)/model/index').then(
                        (m) => m.MobileModelPage,
                      ),
                    'Mobile > Discover > Detail > Model',
                  ),
                  loader: slugLoader,
                  path: 'model/:slug',
                },
                {
                  element: dynamicElement(
                    () =>
                      import('./(main)/discover/(detail)/provider/index').then(
                        (m) => m.MobileProviderPage,
                      ),
                    'Mobile > Discover > Detail > Provider',
                  ),
                  loader: slugLoader,
                  path: 'provider/:slug',
                },
                {
                  element: dynamicElement(
                    () =>
                      import('./(main)/discover/(detail)/mcp/index').then((m) => m.MobileMcpPage),
                    'Mobile > Discover > Detail > MCP',
                  ),
                  loader: slugLoader,
                  path: 'mcp/:slug',
                },
              ],
              element: dynamicElement(
                () => import('./(main)/discover/(detail)/_layout/Mobile/index'),
                'Mobile > Discover > Detail > Layout',
              ),
            },
          ],
          element: dynamicElement(
            () => import('./(main)/discover/_layout/Mobile/index'),
            'Mobile > Discover > Layout',
          ),
          errorElement: <ErrorBoundary resetPath="/discover" />,
          path: 'discover',
        },

        // Settings routes
        {
          children: [
            {
              element: dynamicElement(
                () => import('./(main)/settings/(mobile)'),
                'Mobile > Settings',
              ),
              index: true,
            },
          ],
          element: <MobileSettingsLayout />,
          errorElement: <ErrorBoundary resetPath="/settings" />,
          path: 'settings',
        },

        // Memory routes
        {
          children: [
            {
              element: dynamicElement(() => import('./(main)/memory'), 'Mobile > Memory'),
              index: true,
            },
          ],
          element: <MobileMemoryLayout />,
          errorElement: <ErrorBoundary resetPath="/memory" />,
          path: 'memory',
        },

        // Me routes (mobile personal center)
        {
          children: [
            {
              children: [
                {
                  element: dynamicElement(
                    () => import('./(main)/(mobile)/me/(home)'),
                    'Mobile > Me > Home',
                  ),
                  index: true,
                },
              ],
              element: <MobileMeHomeLayout />,
            },
            {
              children: [
                {
                  element: dynamicElement(
                    () => import('./(main)/(mobile)/me/profile'),
                    'Mobile > Me > Profile',
                  ),
                  path: 'profile',
                },
              ],
              element: <MobileMeProfileLayout />,
            },
            {
              children: [
                {
                  element: dynamicElement(
                    () => import('./(main)/(mobile)/me/settings'),
                    'Mobile > Me > Settings',
                  ),
                  path: 'settings',
                },
              ],
              element: <MobileMeSettingsLayout />,
            },
          ],
          errorElement: <ErrorBoundary resetPath="/me" />,
          path: 'me',
        },

        // Default route - redirect to chat
        {
          index: true,
          loader: () => redirect('/agent', { status: 302 }),
        },

        // Catch-all route
        {
          loader: () => redirect('/agent', { status: 302 }),
          // TODO: NEED use NotFoundPage
          // element: <NotFoundPage />,
          path: '*',
        },
      ],
      element: <MobileMainLayout />,
      errorElement: <ErrorBoundary resetPath="/chat" />,
      path: '/',
    },
  ]);
