import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { FC, PropsWithChildren } from 'react';

import AuthContainer from './_layout';

const AuthLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <NuqsAdapter>
      <AuthContainer>{children}</AuthContainer>
    </NuqsAdapter>
  );
};

AuthLayout.displayName = 'AuthLayout';

export default AuthLayout;
