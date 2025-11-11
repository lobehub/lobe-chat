'use client';

import { memo } from 'react';

import AssistantLayout from '../../(list)/assistant/AssistantLayout';
import AssistantPage from '../../(list)/assistant/AssistantPage';

/**
 * Mobile Discover Assistant List Page
 */
export const MobileDiscoverAssistantPage = memo(() => {
  return (
    <AssistantLayout mobile={true}>
      <AssistantPage mobile={true} />
    </AssistantLayout>
  );
});

MobileDiscoverAssistantPage.displayName = 'MobileDiscoverAssistantPage';
