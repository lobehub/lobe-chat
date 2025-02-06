import StructuredData from '@/components/StructuredData';
import { Locales } from '@/locales/resources';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { DiscoverService } from '@/server/services/discover';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { parsePageLocale } from '@/utils/locale';
import { RouteVariants } from '@/utils/server/routeVariants';

import List from './features/List';

interface Props extends DynamicLayoutProps {
  searchParams: Promise<{ hl?: Locales }>;
}

export const generateMetadata = async (props: Props) => {
  const searchParams = await props.searchParams;
  const { t } = await translation('metadata', searchParams?.hl);
  const locale = await parsePageLocale(props);

  return metadataModule.generate({
    alternate: true,
    description: t('discover.providers.description'),
    locale,
    title: t('discover.providers.title'),
    url: '/discover/providers',
  });
};

const Page = async (props: Props) => {
  const searchParams = await props.searchParams;
  const { t } = await translation('metadata', searchParams?.hl);
  const mobile = await RouteVariants.getIsMobile(props);
  const locale = await parsePageLocale(props);

  const discoverService = new DiscoverService();
  const items = await discoverService.getProviderList(locale);

  const ld = ldModule.generate({
    description: t('discover.providers.description'),
    title: t('discover.providers.title'),
    url: '/discover/providers',
    webpage: {
      enable: true,
      search: '/discover/search',
    },
  });

  return (
    <>
      <StructuredData ld={ld} />
      <List items={items} mobile={mobile} />
    </>
  );
};

Page.DisplayName = 'DiscoverProviders';

export default Page;
