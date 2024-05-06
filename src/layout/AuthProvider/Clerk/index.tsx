'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { PropsWithChildren, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import UserUpdater from './UserUpdater';
import { useAppearance } from './useAppearance';

const Clerk = memo(({ children }: PropsWithChildren) => {
  const appearance = useAppearance();
  const {
    i18n: { language, getResourceBundle },
  } = useTranslation('clerk');

  const localization = useMemo(() => getResourceBundle(language, 'clerk'), [language]);

  return (
    <ClerkProvider appearance={appearance} localization={localization}>
      {children}
      <UserUpdater />
    </ClerkProvider>
  );
});

export default Clerk;
