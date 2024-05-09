import StructuredData from '@/components/StructuredData';
import { translation } from '@/server/translation';
import { ldServices } from '@/services/ld';
import { ogService } from '@/services/og';
import { isMobileDevice } from '@/utils/responsive';

import PageTitle from '../features/PageTitle';
import TelemetryNotification from './features/TelemetryNotification';

export const generateMetadata = async () => {
  const { t } = await translation('metadata');
  return ogService.generate({
    description: t('chat.description'),
    title: t('chat.title'),
    url: '/chat',
  });
};

const Page = async () => {
  const mobile = isMobileDevice();
  const { t } = await translation('metadata');
  const ld = ldServices.generate({
    description: t('chat.description'),
    title: t('chat.title'),
    url: '/chat',
  });

  return (
    <>
      <StructuredData ld={ld} />
      <PageTitle />
      <TelemetryNotification mobile={mobile} />
    </>
  );
};

Page.displayName = 'Chat';

export default Page;
