'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { PropsWithChildren, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import UserUpdater from './UserUpdater';
import { useAppearance } from './useAppearance';

// Adjust the path as necessary

const Clerk = memo(({ children }: PropsWithChildren) => {
  const { enableClerkSignUp } = useServerConfigStore(featureFlagsSelectors);
  const appearance = useAppearance();
  const {
    i18n: { language, getResourceBundle },
  } = useTranslation('clerk');

  const localization = useMemo(() => getResourceBundle(language, 'clerk'), [language]);

  return (
    <ClerkProvider
      appearance={{
        ...appearance,
        elements: {
          ...appearance.elements,
          footerAction: !enableClerkSignUp ? { display: 'none' } : {}, // Conditionally hide sign-up link
        },
      }}
      localization={localization}
      signUpUrl={!enableClerkSignUp ? '/sign-in' : '/sign-up'} // Redirect sign-up to sign-in if disabled
    >
      {children}
      <UserUpdater />
    </ClerkProvider>
  );
});

export default Clerk;
