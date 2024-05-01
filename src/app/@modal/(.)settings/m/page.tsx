import { gerServerDeviceInfo, isMobileDevice } from '@/utils/responsive';

import Page from './index';

export default () => {
  const isMobile = isMobileDevice();
  const { os, browser } = gerServerDeviceInfo();

  return <Page browser={browser} mobile={isMobile} os={os} />;
};
