import { getServerConfig } from '@/config/server';

import Index from './index';

export default () => {
  const { SHOW_ACCESS_CODE_CONFIG, SHOW_OAUTH_LOGIN } = getServerConfig();

  return <Index showAccessCodeConfig={SHOW_ACCESS_CODE_CONFIG} showOAuthLogin={SHOW_OAUTH_LOGIN} />;
};
