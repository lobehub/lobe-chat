import { Metadata } from 'next';

import { getCanonicalUrl } from '@/server/utils/url';

import WorklistPage from './features/WorklistPage';

export const metadata: Metadata = {
  alternates: { canonical: getCanonicalUrl('/worklist') },
  title: 'Serenvale - Worklist',
};

export default WorklistPage;
