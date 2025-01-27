import { Suspense } from 'react';

import StructuredData from '@/components/StructuredData';
import { serverFeatureFlags } from '@/config/featureFlags';
import { BRANDING_NAME } from '@/const/branding';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/server/responsive';

import PageTitle from '../features/PageTitle';
import Changelog from './features/ChangelogModal';
import TelemetryNotification from './features/TelemetryNotification';

export const generateMetadata = async () => {
  const { t } = await translation('metadata');
  return metadataModule.generate({
    description: t('chat.description', { appName: BRANDING_NAME }),
    title: t('chat.title', { appName: BRANDING_NAME }),
    url: '/chat',
  });
};

const Page = async () => {
  const { hideDocs, showChangelog } = serverFeatureFlags();
  const mobile = await isMobileDevice();
  const { t } = await translation('metadata');
  const ld = ldModule.generate({
    description: t('chat.description', { appName: BRANDING_NAME }),
    title: t('chat.title', { appName: BRANDING_NAME }),
    url: '/chat',
  });

  return (
    <>
      <StructuredData ld={ld} />
      <PageTitle />
      <TelemetryNotification mobile={mobile} />
      {showChangelog && !hideDocs && !mobile && (
        <Suspense>
          <Changelog />
        </Suspense>
      )}
    </>
  );
};

Page.displayName = 'Chat';

export default Page;
