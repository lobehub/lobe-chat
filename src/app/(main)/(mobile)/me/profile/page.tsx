import { redirect } from 'next/navigation';

import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/responsive';

import Category from './features/Category';

export const generateMetadata = async () => {
  const { t } = await translation('clerk');
  return metadataModule.generate({
    description: t('userProfile.navbar.title'),
    title: t('userProfile.navbar.description'),
    url: '/me/profile',
  });
};

const Page = () => {
  const mobile = isMobileDevice();

  if (!mobile) return redirect('/profile');

  return <Category />;
};

Page.displayName = 'MeProfile';

export default Page;
