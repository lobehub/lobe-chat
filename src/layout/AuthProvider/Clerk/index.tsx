'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { PropsWithChildren, memo, useEffect, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

import UserUpdater from './UserUpdater';
import { useAppearance } from './useAppearance';

const Clerk = memo(({ children }: PropsWithChildren) => {
  const appearance = useAppearance();
  const {
    i18n: { language, getResourceBundle },
  } = useTranslation('clerk');

  const localization = useMemo(() => getResourceBundle(language, 'clerk'), [language]);

  // When useAppearance returns different result during SSR vs. client-side (when theme mode is auto), the appearance is not applied
  // It's because Clerk internally re-applies SSR props after transition which overrides client-side props, see https://github.com/clerk/javascript/blob/main/packages/nextjs/src/app-router/client/ClerkProvider.tsx
  // This re-renders the provider after transition to make sure client-side props are always applied
  const [, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    if (isPending) return;
    startTransition(() => {
      setCount((count) => count + 1);
    });
  }, [isPending, startTransition]);

  return (
    <ClerkProvider appearance={appearance} localization={localization}>
      {children}
      <UserUpdater />
    </ClerkProvider>
  );
});

export default Clerk;
