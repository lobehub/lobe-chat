'use client';

import dynamic from 'next/dynamic';

import type { Locales } from '@/types/locale';

/**
 * Dynamic import with SSR disabled
 *
 * This creates a pure CSR boundary:
 * - Server renders: nothing (null)
 * - Client hydration: null (matches server)
 * - After hydration: DesktopClientRouter mounts with ReactDOM.createRoot semantics
 *
 * The loading component is optional here since DesktopClientRouter
 * has its own fallbackElement for route-level loading states.
 */
const DesktopRouterClient = dynamic(() => import('./DesktopClientRouter'), {
  ssr: false,
});

interface DesktopRouterProps {
  locale: Locales;
}

/**
 * Desktop Router Wrapper
 *
 * This wrapper exists to:
 * 1. Create a client component boundary for Next.js
 * 2. Enable code splitting (Desktop bundle separated from Mobile)
 * 3. Ensure the entire react-router-dom tree is client-only
 */
const DesktopRouter = ({ locale }: DesktopRouterProps) => {
  return <DesktopRouterClient locale={locale} />;
};

export default DesktopRouter;
