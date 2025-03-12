import urlJoin from 'url-join';

import StructuredData from '@/components/StructuredData';
import { DEFAULT_LANG } from '@/const/locale';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { DiscoverService } from '@/server/services/discover';
import { translation } from '@/server/translation';
import { DiscoverPageProps } from '@/types/discover';
import { RouteVariants } from '@/utils/server/routeVariants';

import List from '../features/List';

const getSharedProps = async (props: DiscoverPageProps) => {
  const params = await props.params;
  const { slug: identifier, variants } = params;
  const { isMobile, locale: hl } = await RouteVariants.deserializeVariants(variants);
  const searchParams = await props.searchParams;
  const { t, locale } = await translation('metadata', searchParams?.hl || hl);

  const discoverService = new DiscoverService();
  const list = await discoverService.getProviderList(locale);
  const cate = list.find((cate) => cate.identifier === identifier);

  return {
    cate,
    discoverService,
    identifier,
    isMobile,
    list,
    locale,
    t,
  };
};

export const generateMetadata = async (props: DiscoverPageProps) => {
  const { t, cate, locale, identifier } = await getSharedProps(props);
  return metadataModule.generate({
    alternate: true,
    description: t('discover.models.description'),
    locale,
    title: [cate?.meta.title, t('discover.models.title')].join(' · '),
    url: urlJoin('/discover/models', identifier),
  });
};

const Page = async (props: DiscoverPageProps) => {
  const { t, cate, locale, identifier, discoverService, isMobile } = await getSharedProps(props);
  const items = await discoverService.getModelCategory(locale, identifier);

  const ld = ldModule.generate({
    description: t('discover.models.description'),
    locale,
    title: [cate?.meta.title, t('discover.models.title')].join(' · '),
    url: urlJoin('/discover/models', identifier),
    webpage: {
      enable: true,
      search: '/discover/search',
    },
  });

  return (
    <>
      <StructuredData ld={ld} />
      <List category={identifier} items={items} mobile={isMobile} />
    </>
  );
};

export const generateStaticParams = async () => {
  const discoverService = new DiscoverService();
  const categories = await discoverService.getProviderList(DEFAULT_LANG);
  return categories.map((cate) => ({ slug: cate.identifier }));
};

Page.DisplayName = 'DiscoverModelsCategory';

export default Page;
