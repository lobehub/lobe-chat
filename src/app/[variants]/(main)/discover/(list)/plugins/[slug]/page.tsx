import urlJoin from 'url-join';

import StructuredData from '@/components/StructuredData';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { DiscoverService } from '@/server/services/discover';
import { translation } from '@/server/translation';
import { DiscoverPageProps, PluginCategory } from '@/types/discover';
import { RouteVariants } from '@/utils/server/routeVariants';

import List from '../features/List';

const getSharedProps = async (props: DiscoverPageProps) => {
  const params = await props.params;
  const { slug: category, variants } = params;
  const { isMobile, locale: hl } = await RouteVariants.deserializeVariants(variants);
  const searchParams = await props.searchParams;

  const { t, locale } = await translation('metadata', searchParams?.hl || hl);
  const { t: td } = await translation('discover', searchParams?.hl || hl);
  return {
    category,
    isMobile,
    locale,
    t,
    td,
  };
};

export const generateMetadata = async (props: DiscoverPageProps) => {
  const { locale, t, td, category } = await getSharedProps(props);
  return metadataModule.generate({
    alternate: true,
    description: t('discover.plugins.description'),
    locale,
    title: [td(`category.plugin.${category}`), t('discover.plugins.title')].join(' · '),
    url: urlJoin('/discover/plugins', category),
  });
};

const Page = async (props: DiscoverPageProps<PluginCategory>) => {
  const { locale, t, td, category, isMobile } = await getSharedProps(props);

  const discoverService = new DiscoverService();
  const items = await discoverService.getPluginCategory(locale, category as PluginCategory);

  const ld = ldModule.generate({
    description: t('discover.plugins.description'),
    locale,
    title: [td(`category.plugin.${category}`), t('discover.plugins.title')].join(' · '),
    url: urlJoin('/discover/plugins', category),
    webpage: {
      enable: true,
      search: '/discover/search',
    },
  });

  return (
    <>
      <StructuredData ld={ld} />
      <List category={category} items={items} mobile={isMobile} />
    </>
  );
};

export const generateStaticParams = async () => {
  const cates = Object.values(PluginCategory);
  return cates.map((cate) => ({
    slug: cate,
  }));
};

Page.DisplayName = 'DiscoverToolsCategory';

export default Page;
