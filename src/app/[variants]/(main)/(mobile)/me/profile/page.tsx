import { redirect } from 'next/navigation';

import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/server/responsive';

import Category from './features/Category';

export const generateMetadata = async () => {
  const { t } = await translation('auth');
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('header.title'),
    url: '/me/profile',
  });
};

const Page = async () => {
  const mobile = await isMobileDevice();

  if (!mobile) return redirect('/profile');

  return <Category />;
};

Page.displayName = 'MeProfile';

export default Page;
