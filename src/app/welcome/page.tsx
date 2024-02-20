import { Metadata } from 'next';
import urlJoin from 'url-join';

import { OFFICIAL_URL } from '@/const/url';
import { isMobileDevice } from '@/utils/responsive';

import DesktopPage from './(desktop)';
import MobilePage from './(mobile)';

const Page = () => {
  const mobile = isMobileDevice();

  const Page = mobile ? MobilePage : DesktopPage;

  return <Page />;
};

export default Page;

export const metadata: Metadata = {
  alternates: { canonical: urlJoin(OFFICIAL_URL, '/welcome') },
};
