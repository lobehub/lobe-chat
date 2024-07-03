'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { PropsWithChildren, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import UserUpdater from './UserUpdater';
import { useAppearance } from './useAppearance';

const Clerk = memo(({ children }: PropsWithChildren) => {
  const { enableClerkSignUp } = useServerConfigStore(featureFlagsSelectors);
  const appearance = useAppearance();
  const {
    i18n: { language, getResourceBundle },
  } = useTranslation('clerk');

  const localization = useMemo(() => getResourceBundle(language, 'clerk'), [language]);

  const updatedAppearance = useMemo(
    () => ({
      ...appearance,
      elements: {
        ...appearance.elements,
        ...(!enableClerkSignUp ? { footerAction: { display: 'none' } } : {}),
      },
    }),
    [appearance, enableClerkSignUp],
  );

  return (
    <ClerkProvider
      appearance={updatedAppearance}
      localization={localization}
      signUpUrl={!enableClerkSignUp ? '/login' : '/signup'} // Redirect sign-up to sign-in if disabled
    >
      {children}
      <UserUpdater />
    </ClerkProvider>
  );
});

export default Clerk;
