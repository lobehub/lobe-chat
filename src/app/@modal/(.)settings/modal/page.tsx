import { gerServerDeviceInfo, isMobileDevice } from '@/utils/server/responsive';

import SettingsModal from './index';

/**
 * @description: Settings Modal (intercepting route: /settings/modal )
 * @refs: https://github.com/lobehub/lobe-chat/discussions/2295#discussioncomment-9290942
 */

const Page = async () => {
  const isMobile = await isMobileDevice();
  const { os, browser } = await gerServerDeviceInfo();

  return <SettingsModal browser={browser} mobile={isMobile} os={os} />;
};

Page.displayName = 'SettingModal';

export default Page;
