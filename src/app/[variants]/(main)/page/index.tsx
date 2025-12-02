'use client';

import { Suspense, memo } from 'react';
import { useParams } from 'react-router-dom';

import Loading from '@/components/Loading/BrandTextLoading';
import PageExplorer from '@/features/PageExplorer';

/**
 * Pages route - dedicated page for managing documents/pages
 * This is extracted from the /resource route to have its own dedicated space
 */
const PagesPage = memo(() => {
  const { id } = useParams<{ id: string }>();

  return (
    <Suspense fallback={<Loading />}>
      <PageExplorer pageId={id} />
    </Suspense>
  );
});

PagesPage.displayName = 'PagesPage';

export default PagesPage;
