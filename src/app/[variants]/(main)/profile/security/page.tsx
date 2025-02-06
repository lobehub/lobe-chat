import { notFound } from 'next/navigation';

import { enableClerk } from '@/const/auth';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import ClerkProfile from '../features/ClerkProfile';

export const generateMetadata = async () => {
  const { t } = await translation('auth');
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('tab.security'),
    url: '/profile/security',
  });
};

const Page = async (props: DynamicLayoutProps) => {
  if (!enableClerk) return notFound();
  const mobile = await RouteVariants.getIsMobile(props);

  return <ClerkProfile mobile={mobile} />;
};

export default Page;
