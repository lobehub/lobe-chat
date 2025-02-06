import { redirect } from 'next/navigation';

import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Category from './features/Category';

export const generateMetadata = async () => {
  const { t } = await translation('auth');
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('header.title'),
    url: '/me/profile',
  });
};

const Page = async (props: DynamicLayoutProps) => {
  const isMobile = await RouteVariants.getIsMobile(props);

  if (!isMobile) return redirect('/profile');

  return <Category />;
};

Page.displayName = 'MeProfile';

export default Page;

export const dynamic = 'force-static';
