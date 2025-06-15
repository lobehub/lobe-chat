import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Page from './index';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('auth', locale);
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('tab.apikey'),
    url: '/profile/apikey',
  });
};

export default () => {
  return <Page />;
};
