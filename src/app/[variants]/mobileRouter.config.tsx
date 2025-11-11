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
              import('./(main)/chat/index').then((m) => ({
                Component: m.MobileChatPage,
              })),
          },
          {
            lazy: () =>
              import('./(main)/chat/settings').then((m) => ({
                Component: m.default,
              })),
            path: 'settings',
          },
        ],
        lazy: () =>
          import('./(main)/chat/_layout/Mobile').then((m) => ({
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
                    Component: m.MobileHomePage,
                  })),
              },
              {
                lazy: () =>
                  import('./(main)/discover/(list)/assistant/index').then((m) => ({
                    Component: m.MobileAssistantPage,
                  })),
                path: 'assistant',
              },
              {
                lazy: () =>
                  import('./(main)/discover/(list)/model/mobile').then((m) => ({
                    Component: m.MobileDiscoverModelPage,
                  })),
                path: 'model',
              },
              {
                lazy: () =>
                  import('./(main)/discover/(list)/provider/mobile').then((m) => ({
                    Component: m.MobileDiscoverProviderPage,
                  })),
                path: 'provider',
              },
              {
                lazy: () =>
                  import('./(main)/discover/(list)/mcp/mobile').then((m) => ({
                    Component: m.MobileDiscoverMcpPage,
                  })),
                path: 'mcp',
              },
            ],
            lazy: () =>
              import('./(main)/discover/(list)/_layout/Mobile/ListLayout').then((m) => ({
                Component: m.MobileDiscoverListLayout,
              })),
          },
          // Detail routes (with DetailLayout)
          {
            children: [
              {
                lazy: () =>
                  import('./(main)/discover/(detail)/assistant/mobile').then((m) => ({
                    Component: m.MobileDiscoverAssistantDetailPage,
                  })),
                path: 'assistant/:slug',
              },
              {
                lazy: () =>
                  import('./(main)/discover/(detail)/model/mobile').then((m) => ({
                    Component: m.MobileDiscoverModelDetailPage,
                  })),
                path: 'model/:slug',
              },
              {
                lazy: () =>
                  import('./(main)/discover/(detail)/provider/mobile').then((m) => ({
                    Component: m.MobileDiscoverProviderDetailPage,
                  })),
                path: 'provider/:slug',
              },
              {
                lazy: () =>
                  import('./(main)/discover/(detail)/mcp/mobile').then((m) => ({
                    Component: m.MobileDiscoverMcpDetailPage,
                  })),
                path: 'mcp/:slug',
              },
            ],
            lazy: () =>
              import('./(main)/discover/(detail)/_layout/Mobile/DetailLayout').then((m) => ({
                Component: m.MobileDiscoverDetailLayout,
              })),
          },
        ],
        lazy: () =>
          import('./(main)/discover/_layout/Mobile/DiscoverLayout').then((m) => ({
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
