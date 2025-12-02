'use client';

import { memo } from 'react';
import { useParams } from 'react-router-dom';

import PageExplorer from '@/app/[variants]/(main)/page/features';

/**
 * Pages route - dedicated page for managing documents/pages
 * This is extracted from the /resource route to have its own dedicated space
 */
const PagesPage = memo(() => {
  const { id } = useParams<{ id: string }>();

  return <PageExplorer pageId={id} />;
});

PagesPage.displayName = 'PagesPage';

export default PagesPage;
