import StructuredData from '@/components/StructuredData';
import { BRANDING_NAME } from '@/const/branding';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/responsive';

import Actions from './features/Actions';
import Hero from './features/Hero';
import Logo from './features/Logo';

export const generateMetadata = async () => {
  const { t } = await translation('metadata');
  return metadataModule.generate({
    description: t('welcome.description', { appName: BRANDING_NAME }),
    title: t('welcome.title', { appName: BRANDING_NAME }),
    url: '/welcome',
  });
};

const Page = async () => {
  const mobile = isMobileDevice();
  const { t } = await translation('metadata');
  const ld = ldModule.generate({
    description: t('welcome.description', { appName: BRANDING_NAME }),
    title: t('welcome.title', { appName: BRANDING_NAME }),
    url: '/welcome',
  });

  return (
    <>
      <StructuredData ld={ld} />
      <Logo mobile={mobile} />
      <Hero />
      <Actions mobile={mobile} />
    </>
  );
};

Page.displayName = 'Welcome';

export default Page;
