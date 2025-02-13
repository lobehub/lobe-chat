import StructuredData from '@/components/StructuredData';
import { Locales } from '@/locales/resources';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { DiscoverService } from '@/server/services/discover';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import List from './features/List';

interface DiscoverPageProps extends DynamicLayoutProps {
  searchParams: Promise<{ hl?: Locales }>;
}

const getSharedProps = async (props: DiscoverPageProps) => {
  const searchParams = await props.searchParams;
  const { locale: hl, isMobile } = await RouteVariants.getVariantsFromProps(props);
  const { t, locale } = await translation('metadata', searchParams?.hl || hl);
  return {
    isMobile,
    locale,
    t,
  };
};

export const generateMetadata = async (props: DiscoverPageProps) => {
  const { locale, t } = await getSharedProps(props);
  return metadataModule.generate({
    alternate: true,
    description: t('discover.plugins.description'),
    locale,
    title: t('discover.plugins.title'),
    url: '/discover/plugins',
  });
};

const Page = async (props: DiscoverPageProps) => {
  const { locale, t, isMobile } = await getSharedProps(props);
  const discoverService = new DiscoverService();
  const items = await discoverService.getPluginList(locale);

  const ld = ldModule.generate({
    description: t('discover.plugins.description'),
    locale,
    title: t('discover.plugins.title'),
    url: '/discover/plugins',
    webpage: {
      enable: true,
      search: '/discover/search',
    },
  });

  return (
    <>
      <StructuredData ld={ld} />
      <List items={items} mobile={isMobile} />
    </>
  );
};

Page.DisplayName = 'DiscoverTools';

export default Page;
