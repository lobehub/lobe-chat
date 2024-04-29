import { Metadata } from 'next';

import { getCanonicalUrl } from '@/const/url';
import { isMobileDevice } from '@/utils/responsive';

import DesktopPage from './(desktop)';
import MobilePage from './(mobile)';
import PageTitle from './features/PageTitle';

export default () => {
  const mobile = isMobileDevice();

  const Page = mobile ? MobilePage : DesktopPage;

  return (
    <>
      <PageTitle />
      <Page />
    </>
  );
};

export const metadata: Metadata = {
  alternates: { canonical: getCanonicalUrl('/market') },
};
