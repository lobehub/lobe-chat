import { getServerConfig } from '@/config/server';
import { isMobileDevice } from '@/utils/responsive';

import DesktopPage from './(desktop)';
import MobilePage from './(mobile)';

const Page = () => {
  const mobile = isMobileDevice();

  if (mobile) return <MobilePage />;

  const { SHOW_ACCESS_CODE_CONFIG, ENABLE_OAUTH_SSO } = getServerConfig();

  return (
    <DesktopPage showAccessCodeConfig={SHOW_ACCESS_CODE_CONFIG} showOAuthLogin={ENABLE_OAUTH_SSO} />
  );
};

export default Page;
