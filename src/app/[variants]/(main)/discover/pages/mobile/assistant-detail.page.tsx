'use client';

import { memo } from 'react';

import AssistantDetailPage from '../../(detail)/assistant/AssistantDetailPage';

/**
 * Mobile Discover Assistant Detail Page
 */
export const MobileDiscoverAssistantDetailPage = memo(() => {
  return <AssistantDetailPage mobile={true} />;
});

MobileDiscoverAssistantDetailPage.displayName = 'MobileDiscoverAssistantDetailPage';
