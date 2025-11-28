'use client';

import { memo } from 'react';
import { useParams } from 'react-router-dom';

import DocumentExplorer from '@/features/ResourceManager/PageExplorer';

/**
 * Pages route - dedicated page for managing documents/pages
 * This is extracted from the /resource route to have its own dedicated space
 */
const PagesPage = memo(() => {
  const { id } = useParams<{ id: string }>();

  return <DocumentExplorer documentId={id} />;
});

PagesPage.displayName = 'PagesPage';

export default PagesPage;
