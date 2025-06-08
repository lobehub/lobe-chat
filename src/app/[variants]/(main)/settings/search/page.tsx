import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import CrawlProvider from './features/CrawlProvider';
import SearchProvider from './features/SearchProvider';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('setting', locale);
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('tab.search'),
    url: '/settings/search',
  });
};

const Page = () => {
  return (
    <>
      <SearchProvider />
      <CrawlProvider />
    </>
  );
};

Page.displayName = 'SearchSettingPage';

export default Page;
