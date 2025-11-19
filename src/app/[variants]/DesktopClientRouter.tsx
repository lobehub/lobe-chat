'use client';

import { memo, Suspense, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';

import type { Locales } from '@/types/locale';

import { createDesktopRouter } from './desktopRouter.config';

interface ClientRouterProps {
  locale: Locales;
}

/**
 * Pure CSR Loading Fallback Component
 *
 * This component is displayed during:
 * - Initial router data loading
 * - Route transitions with loaders
 * - Any async route-level operations
 *
 * NOTE: This runs ONLY on the client, never during SSR
 */
const RouterLoadingFallback = () => (
  <div
    style={{
      alignItems: 'center',
      display: 'flex',
      height: '100vh',
      justifyContent: 'center',
      width: '100vw',
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          animation: 'spin 1s linear infinite',
          border: '4px solid #f3f3f3',
          borderRadius: '50%',
          borderTop: '4px solid #3498db',
          height: '40px',
          margin: '0 auto 16px',
          width: '40px',
        }}
      />
      <p style={{ color: '#666', fontSize: '14px' }}>Loading...</p>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

/**
 * Desktop Client Router Component
 *
 * Pure CSR (Client-Side Rendering) implementation:
 * - Wrapped with Next.js dynamic import (ssr: false) to prevent SSR
 * - Uses React Suspense for client-side loading states
 * - Router instance is memoized based on locale
 * - All route loaders execute ONLY in the browser
 *
 * This component uses ReactDOM.createRoot semantics (via Next.js dynamic import),
 * NOT hydration. There is no server-rendered HTML to match against.
 */
const DesktopClientRouter = memo<ClientRouterProps>(({ locale }) => {
  const router = useMemo(() => createDesktopRouter(locale), [locale]);

  return (
    <Suspense fallback={<RouterLoadingFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  );
});

DesktopClientRouter.displayName = 'DesktopClientRouter';

export default DesktopClientRouter;
