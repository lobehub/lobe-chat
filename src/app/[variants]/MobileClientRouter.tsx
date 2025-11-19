'use client';

import { memo, useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';

import Loading from '@/components/Loading/BrandTextLoading';
import type { Locales } from '@/types/locale';

import { createMobileRouter } from './mobileRouter.config';

interface ClientRouterProps {
  locale: Locales;
}

type RouterInstance = ReturnType<typeof createMobileRouter>;

const MobileClientRouter = memo<ClientRouterProps>(({ locale }) => {
  // Use state to hold router instance, initially null
  const [router, setRouter] = useState<RouterInstance | null>(null);

  // useEffect ensures this only runs on the client
  useEffect(() => {
    // Create router instance only after component mounts in browser
    const mobileRouter = createMobileRouter(locale);
    setRouter(mobileRouter);

    // Cleanup is not necessary as router should persist until unmount
    return () => {
      // Cleanup if needed
    };
  }, [locale]); // Recreate router if locale changes

  // If router hasn't been created yet (during SSR or first client render),
  // show a loading placeholder. This ensures server output matches client output,
  // avoiding hydration mismatch.
  if (!router) {
    return <Loading />;
  }

  // Once router is created, render RouterProvider
  return (
    <RouterProvider router={router} />
  );
});

MobileClientRouter.displayName = 'MobileClientRouter';

export default MobileClientRouter;
