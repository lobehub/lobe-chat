import dynamic from 'next/dynamic';

import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

const ProfileRouter = dynamic(() => import('../ProfileRouter'), { ssr: false });

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('auth', locale);
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('header.title'),
    url: '/profile',
  });
};

const Page = async (props: DynamicLayoutProps) => {
  const mobile = await RouteVariants.getIsMobile(props);

  return <ProfileRouter mobile={mobile} />;
};

export default Page;
