import { redirect } from 'next/navigation';

import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/server/responsive';

import Category from './features/Category';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('header.title'),
    url: '/me/settings',
  });
};

const Page = () => {
  const mobile = isMobileDevice();

  if (!mobile) return redirect('/settings/common');

  return <Category />;
};

Page.displayName = 'MeSettings';

export default Page;
