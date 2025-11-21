'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { createBrowserRouter, redirect, useNavigate, useRouteError } from 'react-router-dom';

import ErrorCapture from '@/components/Error';
import Loading from '@/components/Loading/BrandTextLoading';
import { useGlobalStore } from '@/store/global';
import type { Locales } from '@/types/locale';

import DesktopMainLayout from './(main)/layouts/desktop';
import { idLoader, slugLoader } from './loaders/routeParams';

/**
 * Desktop Router Configuration - Pure CSR Mode
 *
 * IMPORTANT: This router runs ONLY in the browser (client-side).
 *
 * Key characteristics:
 * - createBrowserRouter uses window.history API (client-only)
 * - All loaders execute in the browser during navigation
 * - No server-side rendering or hydration involved
 * - Route data fetching happens on-demand during client navigation
 *
 * The entire router tree is wrapped with Next.js dynamic import (ssr: false),
 * ensuring this code never executes on the server.
 */

// Chat components
const DesktopChatPage = dynamic(
  () => import('./(main)/chat/index').then((m) => m.DesktopChatPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const ChatLayout = dynamic(() => import('./(main)/chat/_layout/Desktop'), {
  loading: () => <Loading />,
  ssr: false,
});

// Changelog components
const ChangelogPage = dynamic(() => import('./(main)/changelog/index').then((m) => m.DesktopPage), {
  loading: () => <Loading />,
  ssr: false,
});
const ChangelogLayout = dynamic(() => import('./(main)/changelog/_layout/Desktop'), {
  loading: () => <Loading />,
  ssr: false,
});

// Discover List components
const DesktopHomePage = dynamic(
  () => import('./(main)/discover/(list)/(home)/index').then((m) => m.DesktopHomePage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DesktopAssistantPage = dynamic(
  () => import('./(main)/discover/(list)/assistant/index').then((m) => m.DesktopAssistantPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverAssistantLayout = dynamic(
  () => import('./(main)/discover/(list)/assistant/_layout/Desktop'),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverListMcpPage = dynamic(
  () => import('./(main)/discover/(list)/mcp/index').then((m) => m.DesktopMcpPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverMcpLayout = dynamic(() => import('./(main)/discover/(list)/mcp/_layout/Desktop'), {
  loading: () => <Loading />,
  ssr: false,
});
const DiscoverListModelPage = dynamic(
  () => import('./(main)/discover/(list)/model/index').then((m) => m.DesktopModelPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverModelLayout = dynamic(
  () => import('./(main)/discover/(list)/model/_layout/Desktop'),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverListProviderPage = dynamic(
  () => import('./(main)/discover/(list)/provider/index').then((m) => m.DesktopProviderPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverListLayout = dynamic(() => import('./(main)/discover/(list)/_layout/Desktop/index'), {
  loading: () => <Loading />,
  ssr: false,
});

// Discover Detail components
const DesktopDiscoverAssistantDetailPage = dynamic(
  () =>
    import('./(main)/discover/(detail)/assistant/index').then(
      (m) => m.DesktopDiscoverAssistantDetailPage,
    ),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverDetailMcpPage = dynamic(
  () => import('./(main)/discover/(detail)/mcp/index').then((m) => m.DesktopMcpPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverDetailModelPage = dynamic(
  () => import('./(main)/discover/(detail)/model/index').then((m) => m.DesktopModelPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverDetailProviderPage = dynamic(
  () => import('./(main)/discover/(detail)/provider/index').then((m) => m.DesktopProviderPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverDetailLayout = dynamic(() => import('./(main)/discover/(detail)/_layout/Desktop'), {
  loading: () => <Loading />,
  ssr: false,
});
const DiscoverLayout = dynamic(() => import('./(main)/discover/_layout/Desktop/index'), {
  loading: () => <Loading />,
  ssr: false,
});

// Knowledge components
const KnowledgeHome = dynamic(() => import('./(main)/knowledge/routes/KnowledgeHome'), {
  loading: () => <Loading />,
  ssr: false,
});
const KnowledgeBasesList = dynamic(() => import('./(main)/knowledge/routes/KnowledgeBasesList'), {
  loading: () => <Loading />,
  ssr: false,
});
const KnowledgeBaseDetail = dynamic(() => import('./(main)/knowledge/routes/KnowledgeBaseDetail'), {
  loading: () => <Loading />,
  ssr: false,
});
const KnowledgeLayout = dynamic(() => import('./(main)/knowledge/_layout/Desktop'), {
  loading: () => <Loading />,
  ssr: false,
});

// Settings components
const SettingsLayout = dynamic(() => import('./(main)/settings/_layout/Desktop'), {
  loading: () => <Loading />,
  ssr: false,
});
const SettingsLayoutWrapper = dynamic(() => import('./(main)/settings/_layout/DesktopWrapper'), {
  loading: () => <Loading />,
  ssr: false,
});

// Image components
const ImagePage = dynamic(() => import('./(main)/image'), {
  loading: () => <Loading />,
  ssr: false,
});
const ImageLayoutWrapper = dynamic(() => import('./(main)/image/_layout/DesktopWrapper'), {
  loading: () => <Loading />,
  ssr: false,
});

// Labs components
const LabsPage = dynamic(() => import('./(main)/labs'), {
  loading: () => <Loading />,
  ssr: false,
});

// Profile components
const ProfileHomePage = dynamic(() => import('./(main)/profile/(home)/desktop'), {
  loading: () => <Loading />,
  ssr: false,
});
const ProfileApikeyPage = dynamic(() => import('./(main)/profile/apikey/index'), {
  loading: () => <Loading />,
  ssr: false,
});
const DesktopProfileSecurityPage = dynamic(
  () => import('./(main)/profile/security/index').then((m) => m.DesktopProfileSecurityPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DesktopProfileStatsPage = dynamic(
  () => import('./(main)/profile/stats/index').then((m) => m.DesktopProfileStatsPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DesktopProfileUsagePage = dynamic(
  () => import('./(main)/profile/usage/index').then((m) => m.DesktopProfileUsagePage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const ProfileLayoutWrapper = dynamic(() => import('./(main)/profile/_layout/DesktopWrapper'), {
  loading: () => <Loading />,
  ssr: false,
});

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

// Error boundary factory for React Router errorElement
const createErrorBoundary = (resetPath: string) => {
  const ErrorBoundary = () => {
    const error = useRouteError() as Error;
    const navigate = useNavigate();

    const reset = () => {
      navigate(resetPath);
    };

    return <ErrorCapture error={error} reset={reset} />;
  };
  return ErrorBoundary;
};

// Create error boundaries for each route
const ChatErrorBoundary = createErrorBoundary('/chat');
const DiscoverErrorBoundary = createErrorBoundary('/discover');
const KnowledgeErrorBoundary = createErrorBoundary('/knowledge');
const SettingsErrorBoundary = createErrorBoundary('/settings');
const ImageErrorBoundary = createErrorBoundary('/image');
const ProfileErrorBoundary = createErrorBoundary('/profile');
const ChangelogErrorBoundary = createErrorBoundary('/changelog');
const RootErrorBoundary = createErrorBoundary('/chat'); // Root level falls back to chat

// Root layout wrapper component
const RootLayout = (props: { locale: Locales }) => (
  <>
    <NavigatorRegistrar />
    <DesktopMainLayout locale={props.locale} />
  </>
);

// Create desktop router configuration
export const createDesktopRouter = (locale: Locales) =>
  createBrowserRouter([
    {
      children: [
        // Chat routes
        {
          children: [
            {
              element: <DesktopChatPage />,
              index: true,
            },
            {
              element: <DesktopChatPage />,
              path: '*',
            },
          ],
          element: <ChatLayout />,
          errorElement: <ChatErrorBoundary />,
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
                      element: <DesktopAssistantPage />,
                      index: true,
                    },
                  ],
                  element: <DiscoverAssistantLayout />,
                  path: 'assistant',
                },
                {
                  children: [
                    {
                      element: <DiscoverListModelPage />,
                      index: true,
                    },
                  ],
                  element: <DiscoverModelLayout />,
                  path: 'model',
                },
                {
                  element: <DiscoverListProviderPage />,
                  path: 'provider',
                },
                {
                  children: [
                    {
                      element: <DiscoverListMcpPage />,
                      index: true,
                    },
                  ],
                  element: <DiscoverMcpLayout />,
                  path: 'mcp',
                },
                {
                  element: <DesktopHomePage />,
                  index: true,
                },
              ],
              element: <DiscoverListLayout />,
            },
            // Detail routes (with DetailLayout)
            {
              children: [
                {
                  element: <DesktopDiscoverAssistantDetailPage />,
                  loader: slugLoader,
                  path: 'assistant/:slug',
                },
                {
                  element: <DiscoverDetailModelPage />,
                  loader: slugLoader,
                  path: 'model/:slug',
                },
                {
                  element: <DiscoverDetailProviderPage />,
                  loader: slugLoader,
                  path: 'provider/:slug',
                },
                {
                  element: <DiscoverDetailMcpPage />,
                  loader: slugLoader,
                  path: 'mcp/:slug',
                },
              ],
              element: <DiscoverDetailLayout />,
            },
          ],
          element: <DiscoverLayout />,
          errorElement: <DiscoverErrorBoundary />,
          path: 'discover',
        },

        // Knowledge routes
        {
          children: [
            {
              element: <KnowledgeHome />,
              index: true,
            },
            {
              element: <KnowledgeBasesList />,
              path: 'bases',
            },
            {
              element: <KnowledgeBaseDetail />,
              loader: idLoader,
              path: 'bases/:id',
            },
            {
              element: <KnowledgeBaseDetail />,
              loader: idLoader,
              path: '*',
            },
          ],
          element: <KnowledgeLayout />,
          errorElement: <KnowledgeErrorBoundary />,
          path: 'knowledge',
        },

        // Settings routes
        {
          children: [
            {
              element: <SettingsLayout />,
              index: true,
            },
          ],
          element: <SettingsLayoutWrapper />,
          errorElement: <SettingsErrorBoundary />,
          path: 'settings',
        },

        // Image routes
        {
          children: [
            {
              element: <ImagePage />,
              index: true,
            },
          ],
          element: <ImageLayoutWrapper />,
          errorElement: <ImageErrorBoundary />,
          path: 'image',
        },

        // Labs routes
        {
          element: <LabsPage />,
          path: 'labs',
        },

        // Profile routes
        {
          children: [
            {
              element: <ProfileHomePage />,
              index: true,
            },
            {
              element: <ProfileApikeyPage />,
              path: 'apikey',
            },
            {
              element: <DesktopProfileSecurityPage />,
              path: 'security',
            },
            {
              element: <DesktopProfileStatsPage />,
              path: 'stats',
            },
            {
              element: <DesktopProfileUsagePage />,
              path: 'usage',
            },
          ],
          element: <ProfileLayoutWrapper />,
          errorElement: <ProfileErrorBoundary />,
          path: 'profile',
        },

        // changelog routes
        {
          children: [
            {
              element: <ChangelogPage />,
              index: true,
            },
          ],
          element: <ChangelogLayout locale={locale} />,
          errorElement: <ChangelogErrorBoundary />,
          path: 'changelog',
        },
        // Default route - redirect to chat
        {
          index: true,
          loader: () => redirect('/chat', { status: 302 }),
        },

        // Catch-all route
        {
          loader: () => redirect('/chat', { status: 302 }),
          path: '*',
        },
      ],
      element: <RootLayout locale={locale} />,
      errorElement: <RootErrorBoundary />,
      path: '/',
    },
  ]);
