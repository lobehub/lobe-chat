import { gerServerDeviceInfo, isMobileDevice } from '@/utils/server/responsive';

import SettingsModal from './index';

/**
 * @description: Settings Modal (intercepting route: /settings/modal )
 * @refs: https://github.com/lobehub/lobe-chat/discussions/2295#discussioncomment-9290942
 */

const Page = () => {
  const isMobile = isMobileDevice();
  const { os, browser } = gerServerDeviceInfo();

  return <SettingsModal browser={browser} mobile={isMobile} os={os} />;
};

Page.displayName = 'SettingModal';

export default Page;
