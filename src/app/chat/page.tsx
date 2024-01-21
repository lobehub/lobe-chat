import { isMobileDevice } from '@/utils/responsive';

import DesktopPage from './(desktop)';
import MobilePage from './(mobile)';
import SessionHydration from './components/SessionHydration';
import Migration from './features/Migration';

const Page = () => {
  const mobile = isMobileDevice();

  const Page = mobile ? MobilePage : DesktopPage;

  return (
    <>
      <Migration>
        <Page />
      </Migration>
      <SessionHydration />
    </>
  );
};

export default Page;
