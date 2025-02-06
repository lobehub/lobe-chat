import { Metadata } from 'next';

import { getCanonicalUrl } from '@/server/utils/url';

export const metadata: Metadata = {
  alternates: { canonical: getCanonicalUrl('/') },
};

export { default } from './loading';

export const dynamic = 'force-static';
