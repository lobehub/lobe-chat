'use client';

import { createBrowserRouter, redirect } from 'react-router-dom';

import MobileHome from '@/app/[variants]/(mobile)/(home)/';
import MobileHomeLayout from '@/app/[variants]/(mobile)/(home)/_layout';
import MobileMainLayout from '@/app/[variants]/(mobile)/_layout';
import MobileChatLayout from '@/app/[variants]/(mobile)/chat/_layout';
import MobileMeHomeLayout from '@/app/[variants]/(mobile)/me/(home)/layout';
import MobileMeProfileLayout from '@/app/[variants]/(mobile)/me/profile/layout';
import MobileMeSettingsLayout from '@/app/[variants]/(mobile)/me/settings/layout';
import Loading from '@/components/Loading/BrandTextLoading';
import { ErrorBoundary, dynamicElement } from '@/utils/router';

import { agentIdLoader, slugLoader } from '../../loaders/routeParams';
import MobileSettingsLayout from '../settings/_layout';

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
              index: true,
              loader: () => redirect('/', { status: 302 }),
            },
            {
              children: [
                {
                  element: dynamicElement(() => import('../chat'), 'Mobile > Chat'),
                  index: true,
                },
                {
                  element: dynamicElement(
                    () => import('../chat/settings'),
                    'Mobile > Chat > Settings',
                  ),
                  path: 'settings',
                },
              ],
              element: <MobileChatLayout />,
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
                  element: dynamicElement(
                    () => import('../../(main)/discover/(list)/(home)'),
                    'Mobile > Discover > List > Home',
                  ),
                  index: true,
                },
                {
                  children: [
                    {
                      element: dynamicElement(
                        () => import('../../(main)/discover/(list)/assistant'),
                        'Mobile > Discover > List > Assistant',
                      ),
                      path: 'assistant',
                    },
                  ],
                  element: dynamicElement(
                    () => import('../../(main)/discover/(list)/assistant/_layout/Mobile'),
                    'Mobile > Discover > List > Assistant > Layout',
                  ),
                },
                {
                  children: [
                    {
                      element: dynamicElement(
                        () => import('../../(main)/discover/(list)/model'),
                        'Mobile > Discover > List > Model',
                      ),
                      path: 'model',
                    },
                  ],
                  element: dynamicElement(
                    () => import('../../(main)/discover/(list)/model/_layout/Mobile'),
                    'Mobile > Discover > List > Model > Layout',
                  ),
                },
                {
                  element: dynamicElement(
                    () => import('../../(main)/discover/(list)/provider'),
                    'Mobile > Discover > List > Provider',
                  ),
                  path: 'provider',
                },
                {
                  children: [
                    {
                      element: dynamicElement(
                        () => import('../../(main)/discover/(list)/mcp'),
                        'Mobile > Discover > List > MCP',
                      ),
                      path: 'mcp',
                    },
                  ],
                  element: dynamicElement(
                    () => import('../../(main)/discover/(list)/mcp/_layout/Mobile'),
                    'Mobile > Discover > List > MCP > Layout',
                  ),
                },
              ],
              element: dynamicElement(
                () => import('../disocver/(list)/_layout'),
                'Mobile > Discover > List > Layout',
              ),
            },
            // Detail routes (with DetailLayout)
            {
              children: [
                {
                  element: dynamicElement(
                    () =>
                      import('../../(main)/discover/(detail)/assistant').then(
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
                      import('../../(main)/discover/(detail)/model').then((m) => m.MobileModelPage),
                    'Mobile > Discover > Detail > Model',
                  ),
                  loader: slugLoader,
                  path: 'model/:slug',
                },
                {
                  element: dynamicElement(
                    () =>
                      import('../../(main)/discover/(detail)/provider').then(
                        (m) => m.MobileProviderPage,
                      ),
                    'Mobile > Discover > Detail > Provider',
                  ),
                  loader: slugLoader,
                  path: 'provider/:slug',
                },
                {
                  element: dynamicElement(
                    () => import('../../(main)/discover/(detail)/mcp').then((m) => m.MobileMcpPage),
                    'Mobile > Discover > Detail > MCP',
                  ),
                  loader: slugLoader,
                  path: 'mcp/:slug',
                },
              ],
              element: dynamicElement(
                () => import('../disocver/(detail)/_layout'),
                'Mobile > Discover > Detail > Layout',
              ),
            },
          ],
          element: dynamicElement(
            () => import('../disocver/_layout'),
            'Mobile > Discover > Layout',
          ),
          errorElement: <ErrorBoundary resetPath="/discover" />,
          path: 'discover',
        },

        // Settings routes
        {
          children: [
            {
              element: dynamicElement(() => import('../settings'), 'Mobile > Settings'),
              index: true,
            },
          ],
          element: <MobileSettingsLayout />,
          errorElement: <ErrorBoundary resetPath="/settings" />,
          path: 'settings',
        },

        // Me routes (mobile personal center)
        {
          children: [
            {
              children: [
                {
                  element: dynamicElement(
                    () => import('@/app/[variants]/(mobile)/me/(home)'),
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
                    () => import('@/app/[variants]/(mobile)/me/profile'),
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
                    () => import('@/app/[variants]/(mobile)/me/settings'),
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

        // Default route - home page
        {
          children: [
            {
              element: <MobileHome />,
              index: true,
            },
          ],
          element: <MobileHomeLayout />,
        },

        // Catch-all route
        {
          loader: () => redirect('/', { status: 302 }),
          // TODO: NEED use NotFoundPage
          // element: <NotFoundPage />,
          path: '*',
        },
      ],
      element: <MobileMainLayout />,
      errorElement: <ErrorBoundary resetPath="/" />,
      path: '/',
    },
  ]);
