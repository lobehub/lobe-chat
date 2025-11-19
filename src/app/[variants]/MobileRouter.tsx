'use client';

import dynamic from 'next/dynamic';

import type { Locales } from '@/types/locale';

/**
 * Dynamic import with SSR disabled
 *
 * This creates a pure CSR boundary:
 * - Server renders: nothing (null)
 * - Client hydration: null (matches server)
 * - After hydration: MobileClientRouter mounts with ReactDOM.createRoot semantics
 *
 * The loading component is optional here since MobileClientRouter
 * has its own fallbackElement for route-level loading states.
 */
const MobileRouterClient = dynamic(() => import('./MobileClientRouter'), {
  ssr: false,
});

interface MobileRouterProps {
  locale: Locales;
}

/**
 * Mobile Router Wrapper
 *
 * This wrapper exists to:
 * 1. Create a client component boundary for Next.js
 * 2. Enable code splitting (Mobile bundle separated from Desktop)
 * 3. Ensure the entire react-router-dom tree is client-only
 */
const MobileRouter = ({ locale }: MobileRouterProps) => {
  return <MobileRouterClient locale={locale} />;
};

export default MobileRouter;
