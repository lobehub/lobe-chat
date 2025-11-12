'use client';

import { useEffect } from 'react';
import { createBrowserRouter, Navigate, useNavigate } from 'react-router-dom';

import { useGlobalStore } from '@/store/global';
import DesktopMainLayout from './(main)/layouts/desktop';

import Loading from '@/components/Loading/BrandTextLoading';
import { idLoader, slugLoader } from './loaders/routeParams';

// Component to register navigate function in global store
const NavigatorRegistrar = () => {
  const navigate = useNavigate();

  useEffect(() => {
    useGlobalStore.setState({ navigate });

    return () => {
      useGlobalStore.setState({ navigate: undefined });
    };
  }, [navigate]);

  return null;
};

// Root layout wrapper component - just registers navigator and renders outlet
// Note: Desktop layout is provided by individual route components
const RootLayout = () => {
    return  <>
    <NavigatorRegistrar />
    <DesktopMainLayout />
  </>
}


// Create desktop router configuration
export const desktopRouter = createBrowserRouter([
  {
    HydrateFallback: ()=><Loading />,
    children: [
      // Chat routes
      {
        HydrateFallback: ()=><Loading />,
        children: [
          {
            index: true,
            lazy: () =>
              import('./(main)/chat/index').then((m) => ({
                Component: m.DesktopChatPage,
              })),
          },
          {
            lazy: () =>
              import('./(main)/chat/index').then((m) => ({
                Component: m.DesktopChatPage,
              })),
            path: '*',
          },
        ],
        lazy: () =>
          import('./(main)/chat/_layout/Desktop').then((m) => ({
            Component: m.default,
          })),
        path: 'chat',
      },

      // Discover routes with nested structure
      {
        children: [
          // List routes (with ListLayout)
          {
            children: [
              {
                index: true,
                lazy: () =>
                  import('./(main)/discover/(list)/(home)/index').then((m) => ({
                    Component: m.DesktopHomePage,
                  })),
              },
              {
                children: [
                  {
                    lazy: () =>
                      import('./(main)/discover/(list)/assistant/index').then((m) => ({
                        Component: m.DesktopAssistantPage,
                      })),
                    path: 'assistant',
                  },
                ],
                lazy: (() => import('./(main)/discover/(list)/assistant/_layout/Desktop').then((m) => ({
                  Component: m.default,
                })))
              },
              {
                children: [{
                  lazy: () =>
                    import('./(main)/discover/(list)/model/index').then((m) => ({
                      Component: m.DesktopModelPage,
                    })),
                  path: 'model',
                },],
                lazy: (() => import('./(main)/discover/(list)/model/_layout/Desktop').then((m) => ({
                  Component: m.default,
                })))
              },
              {
                lazy: () =>
                  import('./(main)/discover/(list)/provider/index').then((m) => ({
                    Component: m.DesktopProviderPage,
                  })),
                path: 'provider',
              },
              {
                children: [
                  {
                    lazy: () =>
                      import('./(main)/discover/(list)/mcp/index').then((m) => ({
                        Component: m.DesktopMcpPage,
                      })),
                      path: 'mcp',
                  },
                ],
                lazy: (() => import('./(main)/discover/(list)/mcp/_layout/Desktop').then((m) => ({
                  Component: m.default,
                }))),
              }
            ],
            lazy: () =>
              import('./(main)/discover/(list)/_layout/Desktop/index').then((m) => ({
                Component: m.default,
              })),
          },
          // Detail routes (with DetailLayout)
          {
            children: [
              {
                lazy: () =>
                  import('./(main)/discover/(detail)/assistant/index').then((m) => ({
                    Component: m.DesktopDiscoverAssistantDetailPage,
                  })),
                loader: slugLoader,
                path: 'assistant/:slug',
              },
              {
                lazy: () =>
                  import('./(main)/discover/(detail)/model/index').then((m) => ({
                    Component: m.DesktopModelPage,
                  })),
                loader: slugLoader,
                path: 'model/:slug',
              },
              {
                lazy: () =>
                  import('./(main)/discover/(detail)/provider/index').then((m) => ({
                    Component: m.DesktopProviderPage,
                  })),
                loader: slugLoader,
                path: 'provider/:slug',
              },
              {
                lazy: () =>
                  import('./(main)/discover/(detail)/mcp/index').then((m) => ({
                    Component: m.DesktopMcpPage,
                  })),
                loader: slugLoader,
                path: 'mcp/:slug',
              },
            ],
            lazy: () =>
              import('./(main)/discover/(detail)/_layout/Desktop').then((m) => ({
                Component: m.default,
              })),
          },
        ],
        lazy: () =>
          import('./(main)/discover/_layout/Desktop/index').then((m) => ({
            Component: m.default,
          })),
        path: 'discover',
      },

      // Knowledge routes
      {
        children: [
          {
            index: true,
            lazy: () =>
              import('./(main)/knowledge/routes/KnowledgeHome').then((m) => ({
                Component: m.default,
              })),
          },
          {
            lazy: () =>
              import('./(main)/knowledge/routes/KnowledgeBasesList').then((m) => ({
                Component: m.default,
              })),
            path: 'bases',
          },
          {
            lazy: () =>
              import('./(main)/knowledge/routes/KnowledgeBaseDetail').then((m) => ({
                Component: m.default,
              })),
            loader: idLoader,
            path: 'bases/:id',
          },
        ],
        lazy: () =>
          import('./(main)/knowledge/_layout/Desktop').then((m) => ({
            Component: m.default,
          })),
        path: 'knowledge',
      },

      // Settings routes
      {
        children: [
          {
            index: true,
            lazy: () =>
              import('./(main)/settings/_layout/Desktop').then((m) => ({
                Component: m.default,
              })),
          },
        ],
        lazy: () =>
          import('./(main)/settings/_layout/DesktopWrapper').then((m) => ({
            Component: m.default,
          })),
        path: 'settings',
      },

      // Image routes
      {
        children: [
          {
            index: true,
            lazy: () =>
              import('./(main)/image').then((m) => ({
                Component: m.default,
              })),
          },
        ],
        lazy: () =>
          import('./(main)/image/_layout/DesktopWrapper').then((m) => ({
            Component: m.default,
          })),
        path: 'image',
      },

      // Labs routes
      {
        lazy: () =>
          import('./(main)/labs').then((m) => ({
            Component: m.default,
          })),
        path: 'labs',
      },

      // Changelog routes
      {
        children: [
          {
            index: true,
            lazy: () =>
              import('./(main)/changelog').then((m) => ({
                Component: m.default,
              })),
          },
        ],
        lazy: () =>
          import('./(main)/changelog/_layout/Desktop').then((m) => ({
            Component: m.default,
          })),
        path: 'changelog',
      },

      // Profile routes
      {
        children: [
          {
            index: true,
            lazy: () =>
              import('./(main)/profile/(home)/desktop').then((m) => ({
                Component: m.default,
              })),
          },
          {
            lazy: () =>
              import('./(main)/profile/apikey/Client').then((m) => ({
                Component: m.default,
              })),
            path: 'apikey',
          },
          {
            lazy: () =>
              import('./(main)/profile/security/desktop').then((m) => ({
                Component: m.default,
              })),
            path: 'security',
          },
          {
            lazy: () =>
              import('./(main)/profile/stats/desktop').then((m) => ({
                Component: m.default,
              })),
            path: 'stats',
          },
        ],
        lazy: () =>
          import('./(main)/profile/_layout/DesktopWrapper').then((m) => ({
            Component: m.default,
          })),
        path: 'profile',
      },

      // Default route - redirect to chat
      {
        element: <Navigate replace to="/chat" />,
        index: true,
      },

      // Catch-all route
      {
        element: <Navigate replace to="/chat" />,
        path: '*',
      },
    ],
    element: <RootLayout />,
    path: '/',
  },
]);
