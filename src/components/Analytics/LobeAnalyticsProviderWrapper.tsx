import { ReactNode, memo } from 'react';

import { LobeAnalyticsProvider } from '@/components/Analytics/LobeAnalyticsProvider';
import { analyticsEnv } from '@/config/analytics';

type Props = {
  children: ReactNode;
};

export const LobeAnalyticsProviderWrapper = memo<Props>(({ children }) => {
  return (
    <LobeAnalyticsProvider
      debugPosthog={analyticsEnv.DEBUG_POSTHOG_ANALYTICS}
      posthogEnabled={analyticsEnv.ENABLED_POSTHOG_ANALYTICS}
      posthogHost={analyticsEnv.POSTHOG_HOST}
      posthogToken={analyticsEnv.POSTHOG_KEY ?? ''}
    >
      {children}
    </LobeAnalyticsProvider>
  );
});

LobeAnalyticsProviderWrapper.displayName = 'LobeAnalyticsProviderWrapper';
