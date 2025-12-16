import { FC, PropsWithChildren } from 'react';

import OnboardingContainer from './_layout';

const OnboardingLayout: FC<PropsWithChildren> = ({ children }) => {
  return <OnboardingContainer>{children}</OnboardingContainer>;
};

OnboardingLayout.displayName = 'OnboardingLayout';

export default OnboardingLayout;
