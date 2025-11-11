'use client';

import { useEffect } from 'react';
import { createBrowserRouter, Navigate, useNavigate } from 'react-router-dom';

import { useGlobalStore } from '@/store/global';
import DesktopMainLayout from './(main)/layouts/desktop';

import Loading from '@/components/Loading/BrandTextLoading';

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
                  import('./(main)/discover/pages/desktop/home.page').then((m) => ({
                    Component: m.DesktopDiscoverHomePage,
                  })),
              },
              {
                lazy: () =>
                  import('./(main)/discover/pages/desktop/assistant.page').then((m) => ({
                    Component: m.DesktopDiscoverAssistantPage,
                  })),
                path: 'assistant',
              },
              {
                lazy: () =>
                  import('./(main)/discover/pages/desktop/model.page').then((m) => ({
                    Component: m.DesktopDiscoverModelPage,
                  })),
                path: 'model',
              },
              {
                lazy: () =>
                  import('./(main)/discover/pages/desktop/provider.page').then((m) => ({
                    Component: m.DesktopDiscoverProviderPage,
                  })),
                path: 'provider',
              },
              {
                lazy: () =>
                  import('./(main)/discover/pages/desktop/mcp.page').then((m) => ({
                    Component: m.DesktopDiscoverMcpPage,
                  })),
                path: 'mcp',
              },
            ],
            lazy: () =>
              import('./(main)/discover/layouts/desktop/list.layout').then((m) => ({
                Component: m.DesktopDiscoverListLayout,
              })),
          },
          // Detail routes (with DetailLayout)
          {
            children: [
              {
                lazy: () =>
                  import('./(main)/discover/pages/desktop/assistant-detail.page').then((m) => ({
                    Component: m.DesktopDiscoverAssistantDetailPage,
                  })),
                path: 'assistant/:slug',
              },
              {
                lazy: () =>
                  import('./(main)/discover/pages/desktop/model-detail.page').then((m) => ({
                    Component: m.DesktopDiscoverModelDetailPage,
                  })),
                path: 'model/:slug',
              },
              {
                lazy: () =>
                  import('./(main)/discover/pages/desktop/provider-detail.page').then((m) => ({
                    Component: m.DesktopDiscoverProviderDetailPage,
                  })),
                path: 'provider/:slug',
              },
              {
                lazy: () =>
                  import('./(main)/discover/pages/desktop/mcp-detail.page').then((m) => ({
                    Component: m.DesktopDiscoverMcpDetailPage,
                  })),
                path: 'mcp/:slug',
              },
            ],
            lazy: () =>
              import('./(main)/discover/layouts/desktop/detail.layout').then((m) => ({
                Component: m.DesktopDiscoverDetailLayout,
              })),
          },
        ],
        lazy: () =>
          import('./(main)/discover/layouts/desktop/discover.layout').then((m) => ({
            Component: m.DesktopDiscoverLayout,
          })),
        path: 'discover',
      },

      // Knowledge routes
      {
        lazy: () =>
          import('./(main)/knowledge/desktop.router').then((m) => ({
            Component: m.DesktopKnowledgeRoutes,
          })),
        path: 'knowledge/*',
      },

      // Settings routes
      {
        lazy: () =>
          import('./(main)/settings/desktop.router').then((m) => ({
            Component: m.DesktopSettingsRoutes,
          })),
        path: 'settings/*',
      },

      // Image routes
      {
        lazy: () =>
          import('./(main)/image/desktop.router').then((m) => ({
            Component: m.DesktopImageRoutes,
          })),
        path: 'image/*',
      },

      // Labs routes
      {
        lazy: () =>
          import('./(main)/labs/desktop.page').then((m) => ({
            Component: m.DesktopLabsPage,
          })),
        path: 'labs',
      },

      // Changelog routes
      {
        lazy: () =>
          import('./(main)/changelog/desktop.page').then((m) => ({
            Component: m.DesktopChangelogPage,
          })),
        path: 'changelog',
      },

      // Profile routes
      {
        lazy: () =>
          import('./(main)/profile/desktop.router').then((m) => ({
            Component: m.DesktopProfileRoutes,
          })),
        path: 'profile/*',
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
