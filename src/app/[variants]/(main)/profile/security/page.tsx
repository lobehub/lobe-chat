import { notFound } from 'next/navigation';

import { enableClerk } from '@/const/auth';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/server/responsive';

import ClerkProfile from '../features/ClerkProfile';

export const generateMetadata = async () => {
  const { t } = await translation('auth');
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('tab.security'),
    url: '/profile/security',
  });
};

const Page = async () => {
  if (!enableClerk) return notFound();
  const mobile = await isMobileDevice();

  return <ClerkProfile mobile={mobile} />;
};

export default Page;
