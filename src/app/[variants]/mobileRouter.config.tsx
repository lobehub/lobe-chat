'use client';

import { useEffect } from 'react';
import { createBrowserRouter, Navigate, useNavigate } from 'react-router-dom';

import { MobileMainLayout } from './(main)/layouts/mobile';
import { useGlobalStore } from '@/store/global';

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
// Note: Mobile layout is provided by individual route components
const RootLayout = () => (
  <>
    <NavigatorRegistrar />
    <MobileMainLayout />
  </>
);

// Create mobile router configuration
export const mobileRouter = createBrowserRouter([
  {
    HydrateFallback: ()=><Loading />,
    children: [
      // Chat routes
      {
        children: [
          {
            index: true,
            lazy: () =>
              import('./(main)/chat/pages/mobile/chat.page').then((m) => ({
                Component: m.MobileChatPage,
              })),
          },
          {
            lazy: () =>
              import('./(main)/chat/pages/mobile/settings.page').then((m) => ({
                Component: m.MobileChatSettingsPage,
              })),
            path: 'settings',
          },
        ],
        lazy: () =>
          import('./(main)/chat/layouts/mobile/chat.layout').then((m) => ({
            Component: m.MobileChatLayout,
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
                  import('./(main)/discover/pages/mobile/home.page').then((m) => ({
                    Component: m.MobileDiscoverHomePage,
                  })),
              },
              {
                lazy: () =>
                  import('./(main)/discover/pages/mobile/assistant.page').then((m) => ({
                    Component: m.MobileDiscoverAssistantPage,
                  })),
                path: 'assistant',
              },
              {
                lazy: () =>
                  import('./(main)/discover/pages/mobile/model.page').then((m) => ({
                    Component: m.MobileDiscoverModelPage,
                  })),
                path: 'model',
              },
              {
                lazy: () =>
                  import('./(main)/discover/pages/mobile/provider.page').then((m) => ({
                    Component: m.MobileDiscoverProviderPage,
                  })),
                path: 'provider',
              },
              {
                lazy: () =>
                  import('./(main)/discover/pages/mobile/mcp.page').then((m) => ({
                    Component: m.MobileDiscoverMcpPage,
                  })),
                path: 'mcp',
              },
            ],
            lazy: () =>
              import('./(main)/discover/layouts/mobile/list.layout').then((m) => ({
                Component: m.MobileDiscoverListLayout,
              })),
          },
          // Detail routes (with DetailLayout)
          {
            children: [
              {
                lazy: () =>
                  import('./(main)/discover/pages/mobile/assistant-detail.page').then((m) => ({
                    Component: m.MobileDiscoverAssistantDetailPage,
                  })),
                path: 'assistant/:slug',
              },
              {
                lazy: () =>
                  import('./(main)/discover/pages/mobile/model-detail.page').then((m) => ({
                    Component: m.MobileDiscoverModelDetailPage,
                  })),
                path: 'model/:slug',
              },
              {
                lazy: () =>
                  import('./(main)/discover/pages/mobile/provider-detail.page').then((m) => ({
                    Component: m.MobileDiscoverProviderDetailPage,
                  })),
                path: 'provider/:slug',
              },
              {
                lazy: () =>
                  import('./(main)/discover/pages/mobile/mcp-detail.page').then((m) => ({
                    Component: m.MobileDiscoverMcpDetailPage,
                  })),
                path: 'mcp/:slug',
              },
            ],
            lazy: () =>
              import('./(main)/discover/layouts/mobile/detail.layout').then((m) => ({
                Component: m.MobileDiscoverDetailLayout,
              })),
          },
        ],
        lazy: () =>
          import('./(main)/discover/layouts/mobile/discover.layout').then((m) => ({
            Component: m.MobileDiscoverLayout,
          })),
        path: 'discover',
      },

      // Knowledge routes
      {
        lazy: () =>
          import('./(main)/knowledge/mobile.router').then((m) => ({
            Component: m.MobileKnowledgeRoutes,
          })),
        path: 'knowledge/*',
      },

      // Settings routes
      {
        lazy: () =>
          import('./(main)/settings/mobile.router').then((m) => ({
            Component: m.MobileSettingsRoutes,
          })),
        path: 'settings/*',
      },

      // Image routes
      {
        lazy: () =>
          import('./(main)/image/mobile.router').then((m) => ({
            Component: m.MobileImageRoutes,
          })),
        path: 'image/*',
      },

      // Labs routes
      {
        lazy: () =>
          import('./(main)/labs/mobile.page').then((m) => ({
            Component: m.MobileLabsPage,
          })),
        path: 'labs',
      },

      // Changelog routes
      {
        lazy: () =>
          import('./(main)/changelog/mobile.page').then((m) => ({
            Component: m.MobileChangelogPage,
          })),
        path: 'changelog',
      },

      // Profile routes
      {
        lazy: () =>
          import('./(main)/profile/mobile.router').then((m) => ({
            Component: m.MobileProfileRoutes,
          })),
        path: 'profile/*',
      },

      // Me routes (mobile personal center)
      {
        lazy: () =>
          import('./(main)/(mobile)/me/mobile.router').then((m) => ({
            Component: m.MobileMeRoutes,
          })),
        path: 'me/*',
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
