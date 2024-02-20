import { Metadata } from 'next';

import { getCanonicalUrl } from '@/const/url';
import { isMobileDevice } from '@/utils/responsive';

import DesktopPage from './(desktop)';
import MobilePage from './(mobile)';

export default () => {
  const mobile = isMobileDevice();

  const Page = mobile ? MobilePage : DesktopPage;

  return <Page />;
};

export const metadata: Metadata = {
  alternates: { canonical: getCanonicalUrl('/market') },
};
