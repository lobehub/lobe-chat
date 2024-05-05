import { authEnv } from '@/config/auth';
import { getServerConfig } from '@/config/server';

import Common from './features/Common';
import Theme from './features/Theme';

const Page = () => {
  const { SHOW_ACCESS_CODE_CONFIG } = getServerConfig();

  return (
    <>
      <Theme />
      <Common
        showAccessCodeConfig={SHOW_ACCESS_CODE_CONFIG}
        showOAuthLogin={authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH}
      />
    </>
  );
};

Page.displayName = 'CommonSetting';

export default Page;
