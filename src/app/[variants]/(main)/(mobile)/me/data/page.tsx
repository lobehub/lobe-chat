import { redirect } from 'next/navigation';

import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Category from './features/Category';

export const generateMetadata = async () => {
  const { t } = await translation('common');
  return metadataModule.generate({
    title: t('userPanel.data'),
    url: '/me/data',
  });
};

const Page = async (props: DynamicLayoutProps) => {
  const isMobile = await RouteVariants.getIsMobile(props);

  if (!isMobile) return redirect('/chat');

  return <Category />;
};

Page.displayName = 'MeData';

export default Page;

export const dynamic = 'force-static';
