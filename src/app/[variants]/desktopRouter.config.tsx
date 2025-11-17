'use client';

import { useEffect } from 'react';
import { type LoaderFunction, createBrowserRouter, redirect, useNavigate } from 'react-router-dom';

import Loading from '@/components/Loading/BrandTextLoading';
import { useGlobalStore } from '@/store/global';
import type { Locales } from '@/types/locale';

import DesktopMainLayout from './(main)/layouts/desktop';
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
const RootLayout = (props: { locale: Locales }) => {
  return (
    <>
      <NavigatorRegistrar />
      <DesktopMainLayout locale={props.locale} />
    </>
  );
};

// Hydration gate loader - waits for client state to be ready before rendering
const hydrationGateLoader: LoaderFunction = () => {
  const { isAppHydrated } = useGlobalStore.getState();

  // 如果状态已经就绪，直接放行
  if (isAppHydrated) {
    return null;
  }

  // 否则，返回一个 Promise，"暂停" 渲染
  return new Promise((resolve) => {
    console.log('[HydrationGate] Waiting for client state...');
    // 订阅 useGlobalStore 的变化
    const unsubscribe = useGlobalStore.subscribe((state) => {
      if (state.isAppHydrated) {
        console.log('[HydrationGate] Client state ready. Gate opened!');
        unsubscribe(); // 清理订阅
        resolve(null); // Promise 完成，门卫放行
      }
    });
  });
};

// Create desktop router configuration
export const createDesktopRouter = (locale: Locales) =>
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
                  children: [
                    {
                      index: true,
                      lazy: () =>
                        import('./(main)/discover/(list)/assistant/index').then((m) => ({
                          Component: m.DesktopAssistantPage,
                        })),
                    },
                  ],
                  lazy: () =>
                    import('./(main)/discover/(list)/assistant/_layout/Desktop').then((m) => ({
                      Component: m.default,
                    })),
                  path: 'assistant',
                },
                {
                  children: [
                    {
                      index: true,
                      lazy: () =>
                        import('./(main)/discover/(list)/model/index').then((m) => ({
                          Component: m.DesktopModelPage,
                        })),
                    },
                  ],
                  lazy: () =>
                    import('./(main)/discover/(list)/model/_layout/Desktop').then((m) => ({
                      Component: m.default,
                    })),
                  path: 'model',
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
                      index: true,
                      lazy: () =>
                        import('./(main)/discover/(list)/mcp/index').then((m) => ({
                          Component: m.DesktopMcpPage,
                        })),
                    },
                  ],
                  lazy: () =>
                    import('./(main)/discover/(list)/mcp/_layout/Desktop').then((m) => ({
                      Component: m.default,
                    })),
                  path: 'mcp',
                },
                {
                  index: true,
                  lazy: () =>
                    import('./(main)/discover/(list)/(home)/index').then((m) => ({
                      Component: m.DesktopHomePage,
                    })),
                },
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
            {
              lazy: () =>
                import('./(main)/knowledge/routes/KnowledgeBaseDetail').then((m) => ({
                  Component: m.default,
                })),
              loader: idLoader,
              path: '*',
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
                import('./(main)/profile/apikey/index').then((m) => ({
                  Component: m.default,
                })),
              path: 'apikey',
            },
            {
              lazy: () =>
                import('./(main)/profile/security/index').then((m) => ({
                  Component: m.DesktopProfileSecurityPage,
                })),
              path: 'security',
            },
            {
              lazy: () =>
                import('./(main)/profile/stats/index').then((m) => ({
                  Component: m.DesktopProfileStatsPage,
                })),
              path: 'stats',
            },
            {
              lazy: () =>
                import('./(main)/profile/usage/index').then((m) => ({
                  Component: m.DesktopProfileUsagePage,
                })),
              path: 'usage',
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
      loader: hydrationGateLoader,
      path: '/',
    },
  ]);
