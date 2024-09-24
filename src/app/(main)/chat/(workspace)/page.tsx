import StructuredData from '@/components/StructuredData';
import { BRANDING_NAME } from '@/const/branding';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/responsive';

import PageTitle from '../features/PageTitle';
import TelemetryNotification from './features/TelemetryNotification';

export const generateMetadata = async () => {
  const { t } = await translation('metadata');
  return metadataModule.generate({
    description: t('chat.title', { appName: BRANDING_NAME }),
    title: t('chat.title', { appName: BRANDING_NAME }),
    url: '/chat',
  });
};

const Page = async () => {
  const mobile = isMobileDevice();
  const { t } = await translation('metadata');
  const ld = ldModule.generate({
    description: t('chat.title', { appName: BRANDING_NAME }),
    title: t('chat.title', { appName: BRANDING_NAME }),
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
