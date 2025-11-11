'use client';

import { memo } from 'react';

import AssistantDetailPage from '../../(detail)/assistant/AssistantDetailPage';

/**
 * Desktop Discover Assistant Detail Page
 */
export const DesktopDiscoverAssistantDetailPage = memo(() => {
  return <AssistantDetailPage mobile={false} />;
});

DesktopDiscoverAssistantDetailPage.displayName = 'DesktopDiscoverAssistantDetailPage';
