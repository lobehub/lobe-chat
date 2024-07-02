'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { PropsWithChildren, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { authEnv } from '@/config/auth';

import UserUpdater from './UserUpdater';
import { useAppearance } from './useAppearance';

// Adjust the path as necessary

const Clerk = memo(({ children }: PropsWithChildren) => {
  const appearance = useAppearance();
  const {
    i18n: { language, getResourceBundle },
  } = useTranslation('clerk');

  const localization = useMemo(() => getResourceBundle(language, 'clerk'), [language]);
  const isSignUpDisabled = authEnv.NEXT_PUBLIC_DISABLE_CLERK_SIGN_UP;

  return (
    <ClerkProvider
      appearance={{
        ...appearance,
        elements: {
          ...appearance.elements,
          footerAction: isSignUpDisabled ? { display: 'none' } : {}, // Conditionally hide sign-up link
        },
      }}
      localization={localization}
      signUpUrl={isSignUpDisabled ? '/sign-in' : '/sign-up'} // Redirect sign-up to sign-in if disabled
    >
      {children}
      <UserUpdater />
    </ClerkProvider>
  );
});

export default Clerk;
