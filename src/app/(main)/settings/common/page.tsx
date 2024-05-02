import { getServerConfig } from '@/config/server';
import { translation } from '@/server/translation';

import Common from './features/Common';
import Theme from './features/Theme';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return {
    title: t('tab.common'),
  };
};

const Page = () => {
  const { SHOW_ACCESS_CODE_CONFIG, ENABLE_OAUTH_SSO } = getServerConfig();
  return (
    <>
      <Theme />
      <Common showAccessCodeConfig={SHOW_ACCESS_CODE_CONFIG} showOAuthLogin={ENABLE_OAUTH_SSO} />
    </>
  );
};

Page.displayName = 'CommonSetting';

export default Page;
