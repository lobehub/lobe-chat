import { isMobileDevice } from '@/utils/responsive';

import DesktopPage from './(desktop)';
import MobilePage from './(mobile)';
import SessionHydration from './components/SessionHydration';
import Migration from './features/Migration';
import PageTitle from './features/PageTitle';

const Page = () => {
  const mobile = isMobileDevice();

  const Page = mobile ? MobilePage : DesktopPage;

  return (
    <>
      <Migration>
        <PageTitle />
        <Page />
      </Migration>
      <SessionHydration />
    </>
  );
};

export default Page;
