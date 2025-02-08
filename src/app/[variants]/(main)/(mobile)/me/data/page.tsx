import { redirect } from 'next/navigation';

import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { isMobileDevice } from '@/utils/server/responsive';
import { RouteVariants } from '@/utils/server/routeVariants';

import Category from './features/Category';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('common', locale);
  return metadataModule.generate({
    title: t('userPanel.data'),
    url: '/me/data',
  });
};

const Page = async () => {
  const mobile = await isMobileDevice();

  if (!mobile) return redirect('/chat');

  return <Category />;
};

Page.displayName = 'MeData';

export default Page;
