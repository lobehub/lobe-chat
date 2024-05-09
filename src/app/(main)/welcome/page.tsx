import StructuredData from '@/components/StructuredData';
import { translation } from '@/server/translation';
import { ldServices } from '@/services/ld';
import { ogService } from '@/services/og';
import { isMobileDevice } from '@/utils/responsive';

import Actions from './features/Actions';
import Hero from './features/Hero';
import Logo from './features/Logo';

export const generateMetadata = async () => {
  const { t } = await translation('metadata');
  return ogService.generate({
    description: t('welcome.description'),
    title: t('welcome.title'),
    url: '/welcome',
  });
};

const Page = async () => {
  const mobile = isMobileDevice();
  const { t } = await translation('metadata');
  const ld = ldServices.generate({
    description: t('welcome.description'),
    title: t('welcome.title'),
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
