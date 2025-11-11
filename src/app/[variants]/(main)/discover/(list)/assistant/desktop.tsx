'use client';

import { memo } from 'react';

import AssistantLayout from './_layout/Desktop';
import AssistantPage from './index';

/**
 * Desktop Discover Assistant List Page
 */
export const DesktopDiscoverAssistantPage = memo(() => {
  return (
    <AssistantLayout>
      <AssistantPage mobile={false} />
    </AssistantLayout>
  );
});

DesktopDiscoverAssistantPage.displayName = 'DesktopDiscoverAssistantPage';
