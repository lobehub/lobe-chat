'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { createBrowserRouter, redirect, useNavigate, useRouteError } from 'react-router-dom';

import ErrorCapture from '@/components/Error';
import Loading from '@/components/Loading/BrandTextLoading';
import { useGlobalStore } from '@/store/global';
import type { Locales } from '@/types/locale';

import { MobileMainLayout } from './(main)/layouts/mobile';
import { idLoader, slugLoader } from './loaders/routeParams';

/**
 * Mobile Router Configuration - Pure CSR Mode
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
const MobileChatPage = dynamic(() => import('./(main)/chat/index').then((m) => m.MobileChatPage), {
  loading: () => <Loading />,
  ssr: false,
});
const ChatSettings = dynamic(() => import('./(main)/chat/settings'), {
  loading: () => <Loading />,
  ssr: false,
});
const ChatLayout = dynamic(() => import('./(main)/chat/_layout/Mobile'), {
  loading: () => <Loading />,
  ssr: false,
});

// Changelog components
const ChangelogPage = dynamic(() => import('./(main)/changelog/index').then((m) => m.MobilePage), {
  loading: () => <Loading />,
  ssr: false,
});
const ChangelogLayout = dynamic(() => import('./(main)/changelog/_layout/Mobile'), {
  loading: () => <Loading />,
  ssr: false,
});
// Discover List components
const MobileHomePage = dynamic(
  () => import('./(main)/discover/(list)/(home)/index').then((m) => m.MobileHomePage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const MobileAssistantPage = dynamic(
  () => import('./(main)/discover/(list)/assistant/index').then((m) => m.MobileAssistantPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverAssistantLayout = dynamic(
  () => import('./(main)/discover/(list)/assistant/_layout/Mobile'),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverListMobileModelPage = dynamic(
  () => import('./(main)/discover/(list)/model/index').then((m) => m.MobileModelPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverModelLayout = dynamic(() => import('./(main)/discover/(list)/model/_layout/Mobile'), {
  loading: () => <Loading />,
  ssr: false,
});
const DiscoverListMobileProviderPage = dynamic(
  () => import('./(main)/discover/(list)/provider/index').then((m) => m.MobileProviderPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverListMobileMcpPage = dynamic(
  () => import('./(main)/discover/(list)/mcp/index').then((m) => m.MobileMcpPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverMcpLayout = dynamic(() => import('./(main)/discover/(list)/mcp/_layout/Mobile'), {
  loading: () => <Loading />,
  ssr: false,
});
const DiscoverListLayout = dynamic(() => import('./(main)/discover/(list)/_layout/Mobile/index'), {
  loading: () => <Loading />,
  ssr: false,
});

// Discover Detail components
const MobileDiscoverAssistantDetailPage = dynamic(
  () =>
    import('./(main)/discover/(detail)/assistant/index').then(
      (m) => m.MobileDiscoverAssistantDetailPage,
    ),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverDetailMobileModelPage = dynamic(
  () => import('./(main)/discover/(detail)/model/index').then((m) => m.MobileModelPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverDetailMobileProviderPage = dynamic(
  () => import('./(main)/discover/(detail)/provider/index').then((m) => m.MobileProviderPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverDetailMobileMcpPage = dynamic(
  () => import('./(main)/discover/(detail)/mcp/index').then((m) => m.MobileMcpPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverDetailLayout = dynamic(
  () => import('./(main)/discover/(detail)/_layout/Mobile/index'),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const DiscoverLayout = dynamic(() => import('./(main)/discover/_layout/Mobile/index'), {
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
const KnowledgeLayout = dynamic(() => import('./(main)/knowledge/_layout/Mobile'), {
  loading: () => <Loading />,
  ssr: false,
});

// Settings components
const SettingsLayout = dynamic(() => import('./(main)/settings/_layout/Mobile'), {
  loading: () => <Loading />,
  ssr: false,
});
const SettingsLayoutWrapper = dynamic(() => import('./(main)/settings/_layout/MobileWrapper'), {
  loading: () => <Loading />,
  ssr: false,
});

// Image components
const ImageComingSoon = dynamic(() => import('./(main)/image/ComingSoon'), {
  loading: () => <Loading />,
  ssr: false,
});
const ImageLayoutMobile = dynamic(() => import('./(main)/image/_layout/Mobile'), {
  loading: () => <Loading />,
  ssr: false,
});

// Labs components
const LabsPage = dynamic(() => import('./(main)/labs'), {
  loading: () => <Loading />,
  ssr: false,
});

// Profile components
const ProfileHomePage = dynamic(() => import('./(main)/profile/(home)'), {
  loading: () => <Loading />,
  ssr: false,
});
const ProfileApikeyPage = dynamic(() => import('./(main)/profile/apikey/index'), {
  loading: () => <Loading />,
  ssr: false,
});
const MobileProfileSecurityPage = dynamic(
  () => import('./(main)/profile/security').then((m) => m.MobileProfileSecurityPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const MobileProfileStatsPage = dynamic(
  () => import('./(main)/profile/stats').then((m) => m.MobileProfileStatsPage),
  {
    loading: () => <Loading />,
    ssr: false,
  },
);
const ProfileLayoutMobile = dynamic(() => import('./(main)/profile/_layout/Mobile'), {
  loading: () => <Loading />,
  ssr: false,
});

// Me (mobile personal center) components
const MeHomePage = dynamic(() => import('./(main)/(mobile)/me/(home)'), {
  loading: () => <Loading />,
  ssr: false,
});
const MeHomeLayout = dynamic(() => import('./(main)/(mobile)/me/(home)/layout'), {
  loading: () => <Loading />,
  ssr: false,
});
const MeProfilePage = dynamic(() => import('./(main)/(mobile)/me/profile'), {
  loading: () => <Loading />,
  ssr: false,
});
const MeProfileLayout = dynamic(() => import('./(main)/(mobile)/me/profile/layout'), {
  loading: () => <Loading />,
  ssr: false,
});
const MeSettingsPage = dynamic(() => import('./(main)/(mobile)/me/settings'), {
  loading: () => <Loading />,
  ssr: false,
});
const MeSettingsLayout = dynamic(() => import('./(main)/(mobile)/me/settings/layout'), {
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
const ChangelogErrorBoundary = createErrorBoundary('/changelog');
const KnowledgeErrorBoundary = createErrorBoundary('/knowledge');
const SettingsErrorBoundary = createErrorBoundary('/settings');
const ImageErrorBoundary = createErrorBoundary('/image');
const ProfileErrorBoundary = createErrorBoundary('/profile');
const MeErrorBoundary = createErrorBoundary('/me'); // Mobile only
const RootErrorBoundary = createErrorBoundary('/chat'); // Root level falls back to chat

// Root layout wrapper component
const RootLayout = (props: { locale: Locales }) => (
  <>
    <NavigatorRegistrar />
    <MobileMainLayout locale={props.locale} />
  </>
);

// Create mobile router configuration
export const createMobileRouter = (locale: Locales) =>
  createBrowserRouter([
    {
      children: [
        // Chat routes
        {
          children: [
            {
              element: <MobileChatPage />,
              index: true,
            },
            {
              element: <ChatSettings />,
              path: 'settings',
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
                  element: <MobileHomePage />,
                  index: true,
                },
                {
                  children: [
                    {
                      element: <MobileAssistantPage />,
                      path: 'assistant',
                    },
                  ],
                  element: <DiscoverAssistantLayout />,
                },
                {
                  children: [
                    {
                      element: <DiscoverListMobileModelPage />,
                      path: 'model',
                    },
                  ],
                  element: <DiscoverModelLayout />,
                },
                {
                  element: <DiscoverListMobileProviderPage />,
                  path: 'provider',
                },
                {
                  children: [
                    {
                      element: <DiscoverListMobileMcpPage />,
                      path: 'mcp',
                    },
                  ],
                  element: <DiscoverMcpLayout />,
                },
              ],
              element: <DiscoverListLayout />,
            },
            // Detail routes (with DetailLayout)
            {
              children: [
                {
                  element: <MobileDiscoverAssistantDetailPage />,
                  loader: slugLoader,
                  path: 'assistant/:slug',
                },
                {
                  element: <DiscoverDetailMobileModelPage />,
                  loader: slugLoader,
                  path: 'model/:slug',
                },
                {
                  element: <DiscoverDetailMobileProviderPage />,
                  loader: slugLoader,
                  path: 'provider/:slug',
                },
                {
                  element: <DiscoverDetailMobileMcpPage />,
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
              element: <ImageComingSoon />,
              index: true,
            },
          ],
          element: <ImageLayoutMobile />,
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
              element: <MobileProfileSecurityPage />,
              path: 'security',
            },
            {
              element: <MobileProfileStatsPage />,
              path: 'stats',
            },
          ],
          element: <ProfileLayoutMobile />,
          errorElement: <ProfileErrorBoundary />,
          path: 'profile',
        },

        // Me routes (mobile personal center)
        {
          children: [
            {
              children: [
                {
                  element: <MeHomePage />,
                  index: true,
                },
              ],
              element: <MeHomeLayout />,
            },
            {
              children: [
                {
                  element: <MeProfilePage />,
                  path: 'profile',
                },
              ],
              element: <MeProfileLayout />,
            },
            {
              children: [
                {
                  element: <MeSettingsPage />,
                  path: 'settings',
                },
              ],
              element: <MeSettingsLayout />,
            },
          ],
          errorElement: <MeErrorBoundary />,
          path: 'me',
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
