import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';

import Common from './features/Common';
import Theme from './features/Theme';

const Page = () => {
  const isEnableAccessCode = useServerConfigStore(serverConfigSelectors.enabledAccessCode);
  const isEnabledOAuth = useServerConfigStore(serverConfigSelectors.enabledOAuthSSO);

  return (
    <>
      <Theme />
      <Common showAccessCodeConfig={isEnableAccessCode} showOAuthLogin={isEnabledOAuth} />
    </>
  );
};

Page.displayName = 'CommonSetting';

export default Page;
