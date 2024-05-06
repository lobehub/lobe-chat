import { getServerConfig } from '@/config/server';
import { enableNextAuth } from '@/const/auth';

import Common from './features/Common';
import Theme from './features/Theme';

const Page = () => {
  const { SHOW_ACCESS_CODE_CONFIG } = getServerConfig();

  return (
    <>
      <Theme />
      <Common showAccessCodeConfig={SHOW_ACCESS_CODE_CONFIG} showOAuthLogin={enableNextAuth} />
    </>
  );
};

Page.displayName = 'CommonSetting';

export default Page;
