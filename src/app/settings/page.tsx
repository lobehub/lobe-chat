import { getServerConfig } from '@/config/server';
import { isMobileDevice } from '@/utils/responsive';

import DesktopPage from './(desktop)';
import MobilePage from './(mobile)';

const Page = () => {
  const mobile = isMobileDevice();

  const Page = mobile ? MobilePage : DesktopPage;

  const { SHOW_ACCESS_CODE_CONFIG } = getServerConfig();

  return <Page showAccessCodeConfig={SHOW_ACCESS_CODE_CONFIG} />;
};

export default Page;
