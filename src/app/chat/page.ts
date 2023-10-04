import { isMobileDevice } from '@/utils/responsive';

import DesktopPage from './(desktop)';
import MobilePage from './(mobile)';

const mobile = isMobileDevice();

const Page = mobile ? MobilePage : DesktopPage;

export default Page;
