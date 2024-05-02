import { gerServerDeviceInfo, isMobileDevice } from '@/utils/responsive';

import Modal from './index';

/**
 * @description: Settings Modal (intercepting route: /settings/modal )
 * @refs: https://github.com/lobehub/lobe-chat/discussions/2295#discussioncomment-9290942
 */

const Page = () => {
  const isMobile = isMobileDevice();
  const { os, browser } = gerServerDeviceInfo();

  return <Modal browser={browser} mobile={isMobile} os={os} />;
};

Page.displayName = 'SettingModal';

export default Page;
