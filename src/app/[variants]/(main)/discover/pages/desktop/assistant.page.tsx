'use client';

import { memo } from 'react';

import AssistantLayout from '../../(list)/assistant/AssistantLayout';
import AssistantPage from '../../(list)/assistant/AssistantPage';

/**
 * Desktop Discover Assistant List Page
 */
export const DesktopDiscoverAssistantPage = memo(() => {
  return (
    <AssistantLayout mobile={false}>
      <AssistantPage mobile={false} />
    </AssistantLayout>
  );
});

DesktopDiscoverAssistantPage.displayName = 'DesktopDiscoverAssistantPage';
