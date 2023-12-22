import { isMobileDevice } from '@/utils/responsive';

import DesktopWelcomePage from './(desktop)';
import MobileWelcomePage from './(mobile)';

/**
 * 根据当前设备类型渲染对应的欢迎页
 * @constructor
 */
const Page = () => {
  const mobile = isMobileDevice();

  const Page = mobile ? MobileWelcomePage : DesktopWelcomePage;

  return <Page />;
};

export default Page;
