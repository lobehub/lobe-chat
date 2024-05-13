import { redirect } from 'next/navigation';

import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/responsive';

import Category from './features/Category';

export const generateMetadata = async () => {
  const { t } = await translation('common');
  return metadataModule.generate({
    title: t('userPanel.data'),
    url: '/me/data',
  });
};

const Page = () => {
  const mobile = isMobileDevice();

  if (!mobile) return redirect('/chat');

  return <Category />;
};

Page.displayName = 'MeData';

export default Page;
