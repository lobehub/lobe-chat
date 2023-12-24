import { isMobileDevice } from '@/utils/responsive';

import DesktopLoginPage from './(desktop)';

/**
 * 根据当前设备类型渲染对应的登录页
 * @constructor
 */
const Page = () => {
  const mobile = isMobileDevice();

  const Page = mobile ? DesktopLoginPage : DesktopLoginPage;

  return <Page />;
};
Page.displayName = 'LoginPage';
export default Page;
