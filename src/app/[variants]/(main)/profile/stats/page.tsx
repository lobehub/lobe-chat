import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Client from './Client';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('auth', locale);
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('tab.stats'),
    url: '/profile/stats',
  });
};

const Page = async (props: DynamicLayoutProps) => {
  const mobile = await RouteVariants.getIsMobile(props);
  return <Client mobile={mobile} />;
};

export default Page;
