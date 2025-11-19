'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { createBrowserRouter, redirect, useNavigate } from 'react-router-dom';

import { useGlobalStore } from '@/store/global';
import type { Locales } from '@/types/locale';

import { MobileMainLayout } from './(main)/layouts/mobile';
import { idLoader, slugLoader } from './loaders/routeParams';
import Loading from '@/components/Loading/BrandTextLoading';

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

const DefalutDynamicConfig = {
  loading: () => <Loading />,
  ssr: false
}

// Chat components
const MobileChatPage = dynamic(
  () => import('./(main)/chat/index').then((m) => m.MobileChatPage),
  DefalutDynamicConfig,
);
const ChatSettings = dynamic(() => import('./(main)/chat/settings'), DefalutDynamicConfig);
const ChatLayout = dynamic(() => import('./(main)/chat/_layout/Mobile'), DefalutDynamicConfig);

// Discover List components
const MobileHomePage = dynamic(
  () => import('./(main)/discover/(list)/(home)/index').then((m) => m.MobileHomePage),
  DefalutDynamicConfig,
);
const MobileAssistantPage = dynamic(
  () => import('./(main)/discover/(list)/assistant/index').then((m) => m.MobileAssistantPage),
  DefalutDynamicConfig,
);
const DiscoverAssistantLayout = dynamic(
  () => import('./(main)/discover/(list)/assistant/_layout/Mobile'),
  DefalutDynamicConfig,
);
const DiscoverListMobileModelPage = dynamic(
  () => import('./(main)/discover/(list)/model/index').then((m) => m.MobileModelPage),
  DefalutDynamicConfig,
);
const DiscoverModelLayout = dynamic(
  () => import('./(main)/discover/(list)/model/_layout/Mobile'),
  DefalutDynamicConfig,
);
const DiscoverListMobileProviderPage = dynamic(
  () => import('./(main)/discover/(list)/provider/index').then((m) => m.MobileProviderPage),
  DefalutDynamicConfig,
);
const DiscoverListMobileMcpPage = dynamic(
  () => import('./(main)/discover/(list)/mcp/index').then((m) => m.MobileMcpPage),
  DefalutDynamicConfig,
);
const DiscoverMcpLayout = dynamic(
  () => import('./(main)/discover/(list)/mcp/_layout/Mobile'),
  DefalutDynamicConfig,
);
const DiscoverListLayout = dynamic(
  () => import('./(main)/discover/(list)/_layout/Mobile/index'),
  DefalutDynamicConfig,
);

// Discover Detail components
const MobileDiscoverAssistantDetailPage = dynamic(
  () =>
    import('./(main)/discover/(detail)/assistant/index').then(
      (m) => m.MobileDiscoverAssistantDetailPage,
    ),
  DefalutDynamicConfig,
);
const DiscoverDetailMobileModelPage = dynamic(
  () => import('./(main)/discover/(detail)/model/index').then((m) => m.MobileModelPage),
  DefalutDynamicConfig,
);
const DiscoverDetailMobileProviderPage = dynamic(
  () => import('./(main)/discover/(detail)/provider/index').then((m) => m.MobileProviderPage),
  DefalutDynamicConfig,
);
const DiscoverDetailMobileMcpPage = dynamic(
  () => import('./(main)/discover/(detail)/mcp/index').then((m) => m.MobileMcpPage),
  DefalutDynamicConfig,
);
const DiscoverDetailLayout = dynamic(
  () => import('./(main)/discover/(detail)/_layout/Mobile/index'),
  DefalutDynamicConfig,
);
const DiscoverLayout = dynamic(
  () => import('./(main)/discover/_layout/Mobile/index'),
  DefalutDynamicConfig,
);

// Knowledge components
const KnowledgeHome = dynamic(() => import('./(main)/knowledge/routes/KnowledgeHome'), DefalutDynamicConfig);
const KnowledgeBasesList = dynamic(() => import('./(main)/knowledge/routes/KnowledgeBasesList'), DefalutDynamicConfig);
const KnowledgeBaseDetail = dynamic(
  () => import('./(main)/knowledge/routes/KnowledgeBaseDetail'),
  DefalutDynamicConfig,
);
const KnowledgeLayout = dynamic(() => import('./(main)/knowledge/_layout/Mobile'), DefalutDynamicConfig);

// Settings components
const SettingsLayout = dynamic(() => import('./(main)/settings/_layout/Mobile'), DefalutDynamicConfig);
const SettingsLayoutWrapper = dynamic(() => import('./(main)/settings/_layout/MobileWrapper'), DefalutDynamicConfig);

// Image components
const ImageComingSoon = dynamic(() => import('./(main)/image/ComingSoon'), DefalutDynamicConfig);
const ImageLayoutMobile = dynamic(() => import('./(main)/image/_layout/Mobile'), DefalutDynamicConfig);

// Labs components
const LabsPage = dynamic(() => import('./(main)/labs'), DefalutDynamicConfig);

// Profile components
const ProfileHomePage = dynamic(() => import('./(main)/profile/(home)'), DefalutDynamicConfig);
const ProfileApikeyPage = dynamic(() => import('./(main)/profile/apikey/index'), DefalutDynamicConfig);
const MobileProfileSecurityPage = dynamic(
  () => import('./(main)/profile/security').then((m) => m.MobileProfileSecurityPage),
  DefalutDynamicConfig,
);
const MobileProfileStatsPage = dynamic(
  () => import('./(main)/profile/stats').then((m) => m.MobileProfileStatsPage),
  DefalutDynamicConfig,
);
const ProfileLayoutMobile = dynamic(() => import('./(main)/profile/_layout/Mobile'), DefalutDynamicConfig);

// Me (mobile personal center) components
const MeHomePage = dynamic(() => import('./(main)/(mobile)/me/(home)'), DefalutDynamicConfig);
const MeHomeLayout = dynamic(() => import('./(main)/(mobile)/me/(home)/layout'), DefalutDynamicConfig);
const MeProfilePage = dynamic(() => import('./(main)/(mobile)/me/profile'), DefalutDynamicConfig);
const MeProfileLayout = dynamic(() => import('./(main)/(mobile)/me/profile/layout'), DefalutDynamicConfig);
const MeSettingsPage = dynamic(() => import('./(main)/(mobile)/me/settings'), DefalutDynamicConfig);
const MeSettingsLayout = dynamic(() => import('./(main)/(mobile)/me/settings/layout'), DefalutDynamicConfig);

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
          path: 'me',
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
      path: '/',
    },
  ]);
