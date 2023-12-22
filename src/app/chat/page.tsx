import { isMobileDevice } from '@/utils/responsive';

import ChatIndexPageForDesktop from './(desktop)';
import MobilePage from './(mobile)';
import Migration from './features/Migration';

const Page = () => {
  const mobile = isMobileDevice();

  const ChatIndexPage = mobile ? MobilePage : ChatIndexPageForDesktop;

  return (
    <Migration>
      <ChatIndexPage />
    </Migration>
  );
};

export default Page;
