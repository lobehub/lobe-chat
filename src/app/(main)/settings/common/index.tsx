import { getServerConfig } from '@/config/server';

import Common from './features/Common';
import Theme from './features/Theme';

const { SHOW_ACCESS_CODE_CONFIG, ENABLE_OAUTH_SSO } = getServerConfig();

const Page = () => {
  return (
    <>
      <Theme />
      <Common showAccessCodeConfig={SHOW_ACCESS_CODE_CONFIG} showOAuthLogin={ENABLE_OAUTH_SSO} />
    </>
  );
};

Page.displayName = 'CommonSetting';

export default Page;
