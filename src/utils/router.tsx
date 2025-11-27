'use client';

import { DynamicOptions, Loader } from 'next/dist/shared/lib/dynamic';
import dynamic from 'next/dynamic';
import { ComponentType, ReactElement, createElement, memo, useCallback, useEffect } from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';

import Loading from '@/components/Loading/BrandTextLoading';
import { useGlobalStore } from '@/store/global';

export default function dynamicPage<P = NonNullable<unknown>>(
  dynamicOptions: DynamicOptions<P> | Loader<P>,
  options?: DynamicOptions<P>,
): ComponentType<P> {
  return dynamic(dynamicOptions, {
    loading: () => <Loading />,
    ssr: false,
    ...options,
  });
}

/**
 * Helper function to create a dynamic page element directly for router configuration
 * This eliminates the need to define const for each component
 *
 * @example
 * // Instead of:
 * // const ChatPage = dynamicPage(() => import('./chat'));
 * // element: <ChatPage />
 *
 * // You can now use:
 * // element: dynamicElement(() => import('./chat'))
 */
export function dynamicElement<P = NonNullable<unknown>>(
  dynamicOptions: DynamicOptions<P> | Loader<P>,
  options?: DynamicOptions<P>,
): ReactElement {
  const Component = dynamicPage(dynamicOptions, options);
  // @ts-ignore
  return <Component {...({} as P)} />;
}

/**
 * Error boundary component for React Router
 * Displays an error page and provides a reset function to navigate to a specific path
 *
 * @example
 * import { ErrorBoundary } from '@/utils/dynamicPage';
 *
 * // In router config:
 * {
 *   path: 'chat',
 *   errorElement: <ErrorBoundary resetPath="/chat" />
 * }
 */
export interface ErrorBoundaryProps {
  resetPath: string;
}

export const ErrorBoundary = memo<ErrorBoundaryProps>(({ resetPath }) => {
  const ErrorCapture = require('@/components/Error').default;

  const error = useRouteError() as Error;
  const navigate = useNavigate();

  const reset = useCallback(() => {
    navigate(resetPath);
  }, [navigate, resetPath]);

  return createElement(ErrorCapture, { error, reset });
});

/**
 * Component to register navigate function in global store
 * This allows navigation to be triggered from anywhere in the app, including stores
 *
 * @example
 * import { NavigatorRegistrar } from '@/utils/dynamicPage';
 *
 * // In router root layout:
 * const RootLayout = () => (
 *   <>
 *     <NavigatorRegistrar />
 *     <YourMainLayout />
 *   </>
 * );
 */
export const NavigatorRegistrar = memo(() => {
  const navigate = useNavigate();

  useEffect(() => {
    useGlobalStore.setState({ navigate });
    return () => {
      useGlobalStore.setState({ navigate: undefined });
    };
  }, [navigate]);

  return null;
});
