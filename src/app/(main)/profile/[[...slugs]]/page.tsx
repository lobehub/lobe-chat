import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/server/responsive';

import Client from './Client';

export const generateMetadata = async () => {
  const { t } = await translation('clerk');
  return metadataModule.generate({
    description: t('userProfile.navbar.title'),
    title: t('userProfile.navbar.description'),
    url: '/profile',
  });
};

const Page = () => {
  const mobile = isMobileDevice();
  return <Client mobile={mobile} />;
};

export default Page;
