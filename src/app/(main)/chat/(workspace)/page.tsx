import { isMobileDevice } from '@/utils/responsive';

import PageTitle from '../features/PageTitle';
import TelemetryNotification from './features/TelemetryNotification';

const Page = () => {
  const mobile = isMobileDevice();

  return (
    <>
      <PageTitle />
      <TelemetryNotification mobile={mobile} />
    </>
  );
};

Page.displayName = 'Chat';

export default Page;
