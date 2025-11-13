'use client';

import { useEffect } from 'react';
import { Navigate, createBrowserRouter, useNavigate } from 'react-router-dom';

import Loading from '@/components/Loading/BrandTextLoading';
import { useGlobalStore } from '@/store/global';
import type { Locales } from '@/types/locale';

import MobileChangelogLayout from './(main)/changelog/_layout/Mobile';
import MobileMeLayout from './(main)/(mobile)/me/_layout/index';
import { MobileMainLayout } from './(main)/layouts/mobile';
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
// Note: Mobile layout is provided by individual route components
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
      HydrateFallback: () => <Loading />,
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
                  children: [
                    {
                      lazy: () =>
                        import('./(main)/discover/(list)/assistant/index').then((m) => ({
                          Component: m.MobileAssistantPage,
                        })),
                      path: 'assistant',
                    },
                  ],
                  lazy: () =>
                    import('./(main)/discover/(list)/assistant/_layout/Mobile').then((m) => ({
                      Component: m.default,
                    })),
                },
                {
                  children: [
                    {
                      lazy: () =>
                        import('./(main)/discover/(list)/model/index').then((m) => ({
                          Component: m.MobileModelPage,
                        })),
                      path: 'model',
                    },
                  ],
                  lazy: () =>
                    import('./(main)/discover/(list)/model/_layout/Mobile').then((m) => ({
                      Component: m.default,
                    })),
                },
                {
                  lazy: () =>
                    import('./(main)/discover/(list)/provider/index').then((m) => ({
                      Component: m.MobileProviderPage,
                    })),
                  path: 'provider',
                },
                {
                  children: [
                    {
                      lazy: () =>
                        import('./(main)/discover/(list)/mcp/index').then((m) => ({
                          Component: m.MobileMcpPage,
                        })),
                      path: 'mcp',
                    },
                  ],
                  lazy: () =>
                    import('./(main)/discover/(list)/mcp/_layout/Mobile').then((m) => ({
                      Component: m.default,
                    })),
                },
              ],
              lazy: () =>
                import('./(main)/discover/(list)/_layout/Mobile/index').then((m) => ({
                  Component: m.default,
                })),
            },
            // Detail routes (with DetailLayout)
            {
              children: [
                {
                  lazy: () =>
                    import('./(main)/discover/(detail)/assistant/index').then((m) => ({
                      Component: m.MobileDiscoverAssistantDetailPage,
                    })),
                  loader: slugLoader,
                  path: 'assistant/:slug',
                },
                {
                  lazy: () =>
                    import('./(main)/discover/(detail)/model/index').then((m) => ({
                      Component: m.MobileModelPage,
                    })),
                  loader: slugLoader,
                  path: 'model/:slug',
                },
                {
                  lazy: () =>
                    import('./(main)/discover/(detail)/provider/index').then((m) => ({
                      Component: m.MobileProviderPage,
                    })),
                  loader: slugLoader,
                  path: 'provider/:slug',
                },
                {
                  lazy: () =>
                    import('./(main)/discover/(detail)/mcp/index').then((m) => ({
                      Component: m.MobileMcpPage,
                    })),
                  loader: slugLoader,
                  path: 'mcp/:slug',
                },
              ],
              lazy: () =>
                import('./(main)/discover/(detail)/_layout/Mobile/index').then((m) => ({
                  Component: m.default,
                })),
            },
          ],
          lazy: () =>
            import('./(main)/discover/_layout/Mobile/index').then((m) => ({
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
            import('./(main)/knowledge/_layout/Mobile').then((m) => ({
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
                import('./(main)/settings/_layout/Mobile').then((m) => ({
                  Component: m.default,
                })),
            },
          ],
          lazy: () =>
            import('./(main)/settings/_layout/MobileWrapper').then((m) => ({
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
                import('./(main)/image/ComingSoon').then((m) => ({
                  Component: m.default,
                })),
            },
          ],
          lazy: () =>
            import('./(main)/image/_layout/Mobile').then((m) => ({
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
                  Component: m.MobilePage,
                })),
            },
          ],
          element: <MobileChangelogLayout locale={locale} />,
          path: 'changelog',
        },

        // Profile routes
        {
          children: [
            {
              index: true,
              lazy: () =>
                import('./(main)/profile/(home)').then((m) => ({
                  Component: m.default,
                })),
            },
            {
              lazy: () =>
                import('./(main)/profile/apikey/index').then((m) => ({
                  Component: m.default,
                })),
              path: 'apikey',
            },
            {
              lazy: () =>
                import('./(main)/profile/security').then((m) => ({
                  Component: m.MobileProfileSecurityPage,
                })),
              path: 'security',
            },
            {
              lazy: () =>
                import('./(main)/profile/stats').then((m) => ({
                  Component: m.MobileProfileStatsPage,
                })),
              path: 'stats',
            },
          ],
          lazy: () =>
            import('./(main)/profile/_layout/Mobile').then((m) => ({
              Component: m.default,
            })),
          path: 'profile',
        },

        // Me routes (mobile personal center)
        {
          children: [
            {
              index: true,
              lazy: () =>
                import('./(main)/(mobile)/me/(home)').then((m) => ({
                  Component: m.default,
                })),
            },
            {
              lazy: () =>
                import('./(main)/(mobile)/me/profile').then((m) => ({
                  Component: m.default,
                })),
              path: 'profile',
            },
            {
              lazy: () =>
                import('./(main)/(mobile)/me/settings').then((m) => ({
                  Component: m.default,
                })),
              path: 'settings',
            },
          ],
          element: <MobileMeLayout />,
          path: 'me',
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
      element: <RootLayout locale={locale} />,
      path: '/',
    },
  ]);
