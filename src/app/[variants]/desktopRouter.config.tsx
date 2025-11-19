'use client';

import { createBrowserRouter, redirect } from 'react-router-dom';

import type { Locales } from '@/types/locale';

// Import all components directly
import ChatLayout from './(main)/chat/_layout/Desktop';
// import { DesktopHomePage } from './(main)/discover/(list)/(home)/index';
// import { DesktopAssistantPage } from './(main)/discover/(list)/assistant/index';
// import DiscoverAssistantLayout from './(main)/discover/(list)/assistant/_layout/Desktop';
// import { DesktopMcpPage as DiscoverListMcpPage } from './(main)/discover/(list)/mcp/index';
// import DiscoverMcpLayout from './(main)/discover/(list)/mcp/_layout/Desktop';
// import { DesktopModelPage as DiscoverListModelPage } from './(main)/discover/(list)/model/index';
// import DiscoverModelLayout from './(main)/discover/(list)/model/_layout/Desktop';
// import { DesktopProviderPage as DiscoverListProviderPage } from './(main)/discover/(list)/provider/index';
// import DiscoverListLayout from './(main)/discover/(list)/_layout/Desktop/index';
// import { DesktopDiscoverAssistantDetailPage } from './(main)/discover/(detail)/assistant/index';
// import { DesktopMcpPage as DiscoverDetailMcpPage } from './(main)/discover/(detail)/mcp/index';
// import { DesktopModelPage as DiscoverDetailModelPage } from './(main)/discover/(detail)/model/index';
// import { DesktopProviderPage as DiscoverDetailProviderPage } from './(main)/discover/(detail)/provider/index';
// import DiscoverDetailLayout from './(main)/discover/(detail)/_layout/Desktop';
// import DiscoverLayout from './(main)/discover/_layout/Desktop/index';
// import ImagePage from './(main)/image';
// import ImageLayoutWrapper from './(main)/image/_layout/DesktopWrapper';
// import KnowledgeBaseDetail from './(main)/knowledge/routes/KnowledgeBaseDetail';
// import KnowledgeBasesList from './(main)/knowledge/routes/KnowledgeBasesList';
// import KnowledgeHome from './(main)/knowledge/routes/KnowledgeHome';
// import KnowledgeLayout from './(main)/knowledge/_layout/Desktop';
// import LabsPage from './(main)/labs';
import DesktopMainLayout from './(main)/layouts/desktop';
// import ProfileHomePage from './(main)/profile/(home)/desktop';
// import ProfileApikeyPage from './(main)/profile/apikey/index';
// import { DesktopProfileSecurityPage } from './(main)/profile/security/index';
// import { DesktopProfileStatsPage } from './(main)/profile/stats/index';
// import { DesktopProfileUsagePage } from './(main)/profile/usage/index';
// import ProfileLayoutWrapper from './(main)/profile/_layout/DesktopWrapper';
// import SettingsLayout from './(main)/settings/_layout/Desktop';
// import SettingsLayoutWrapper from './(main)/settings/_layout/DesktopWrapper';
// import { idLoader, slugLoader } from './loaders/routeParams';

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

// Component to register navigate function in global store
// const NavigatorRegistrar = () => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     useGlobalStore.setState({ navigate });

//     return () => {
//       useGlobalStore.setState({ navigate: undefined });
//     };
//   }, [navigate]);

//   return null;
// };

// Root layout wrapper component - just registers navigator and renders outlet
// Note: Desktop layout is provided by individual route components
const RootLayout = (props: { locale: Locales }) => (
  <>
    {/* <NavigatorRegistrar /> */}
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
          element: <ChatLayout />,
          path: 'chat',
        },

        // Discover routes with nested structure
        // {
        //   children: [
        //     // List routes (with ListLayout)
        //     {
        //       children: [
        //         {
        //           children: [
        //             {
        //               element: <DesktopAssistantPage />,
        //               index: true,
        //             },
        //           ],
        //           element: <DiscoverAssistantLayout />,
        //           path: 'assistant',
        //         },
        //         {
        //           children: [
        //             {
        //               element: <DiscoverListModelPage />,
        //               index: true,
        //             },
        //           ],
        //           element: <DiscoverModelLayout />,
        //           path: 'model',
        //         },
        //         {
        //           element: <DiscoverListProviderPage />,
        //           path: 'provider',
        //         },
        //         {
        //           children: [
        //             {
        //               element: <DiscoverListMcpPage />,
        //               index: true,
        //             },
        //           ],
        //           element: <DiscoverMcpLayout />,
        //           path: 'mcp',
        //         },
        //         {
        //           element: <DesktopHomePage />,
        //           index: true,
        //         },
        //       ],
        //       element: <DiscoverListLayout />,
        //     },
        //     // Detail routes (with DetailLayout)
        //     {
        //       children: [
        //         {
        //           element: <DesktopDiscoverAssistantDetailPage />,
        //           loader: slugLoader,
        //           path: 'assistant/:slug',
        //         },
        //         {
        //           element: <DiscoverDetailModelPage />,
        //           loader: slugLoader,
        //           path: 'model/:slug',
        //         },
        //         {
        //           element: <DiscoverDetailProviderPage />,
        //           loader: slugLoader,
        //           path: 'provider/:slug',
        //         },
        //         {
        //           element: <DiscoverDetailMcpPage />,
        //           loader: slugLoader,
        //           path: 'mcp/:slug',
        //         },
        //       ],
        //       element: <DiscoverDetailLayout />,
        //     },
        //   ],
        //   element: <DiscoverLayout />,
        //   path: 'discover',
        // },

        // // Knowledge routes
        // {
        //   children: [
        //     {
        //       index: true,
        //       lazy: () =>
        //         import('./(main)/knowledge/routes/KnowledgeHome').then((m) => ({
        //           Component: m.default,
        //         })),
        //     },
        //     {
        //       lazy: () =>
        //         import('./(main)/knowledge/routes/KnowledgeBasesList').then((m) => ({
        //           Component: m.default,
        //         })),
        //       path: 'bases',
        //     },
        //     {
        //       lazy: () =>
        //         import('./(main)/knowledge/routes/KnowledgeBaseDetail').then((m) => ({
        //           Component: m.default,
        //         })),
        //       loader: idLoader,
        //       path: 'bases/:id',
        //     },
        //     {
        //       lazy: () =>
        //         import('./(main)/knowledge/routes/KnowledgeBaseDetail').then((m) => ({
        //           Component: m.default,
        //         })),
        //       loader: idLoader,
        //       path: '*',
        //     },
        //   ],
        //   lazy: () =>
        //     import('./(main)/knowledge/_layout/Desktop').then((m) => ({
        //       Component: m.default,
        //     })),
        //   path: 'knowledge',
        // },

        // // Settings routes
        // {
        //   children: [
        //     {
        //       index: true,
        //       lazy: () =>
        //         import('./(main)/settings/_layout/Desktop').then((m) => ({
        //           Component: m.default,
        //         })),
        //     },
        //   ],
        //   lazy: () =>
        //     import('./(main)/settings/_layout/DesktopWrapper').then((m) => ({
        //       Component: m.default,
        //     })),
        //   path: 'settings',
        // },

        // // Image routes
        // {
        //   children: [
        //     {
        //       index: true,
        //       lazy: () =>
        //         import('./(main)/image').then((m) => ({
        //           Component: m.default,
        //         })),
        //     },
        //   ],
        //   lazy: () =>
        //     import('./(main)/image/_layout/DesktopWrapper').then((m) => ({
        //       Component: m.default,
        //     })),
        //   path: 'image',
        // },

        // // Labs routes
        // {
        //   lazy: () =>
        //     import('./(main)/labs').then((m) => ({
        //       Component: m.default,
        //     })),
        //   path: 'labs',
        // },

        // // Profile routes
        // {
        //   children: [
        //     {
        //       index: true,
        //       lazy: () =>
        //         import('./(main)/profile/(home)/desktop').then((m) => ({
        //           Component: m.default,
        //         })),
        //     },
        //     {
        //       lazy: () =>
        //         import('./(main)/profile/apikey/index').then((m) => ({
        //           Component: m.default,
        //         })),
        //       path: 'apikey',
        //     },
        //     {
        //       lazy: () =>
        //         import('./(main)/profile/security/index').then((m) => ({
        //           Component: m.DesktopProfileSecurityPage,
        //         })),
        //       path: 'security',
        //     },
        //     {
        //       lazy: () =>
        //         import('./(main)/profile/stats/index').then((m) => ({
        //           Component: m.DesktopProfileStatsPage,
        //         })),
        //       path: 'stats',
        //     },
        //     {
        //       lazy: () =>
        //         import('./(main)/profile/usage/index').then((m) => ({
        //           Component: m.DesktopProfileUsagePage,
        //         })),
        //       path: 'usage',
        //     },
        //   ],
        //   lazy: () =>
        //     import('./(main)/profile/_layout/DesktopWrapper').then((m) => ({
        //       Component: m.default,
        //     })),
        //   path: 'profile',
        // },

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
