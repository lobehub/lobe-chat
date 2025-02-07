import urlJoin from 'url-join';

import StructuredData from '@/components/StructuredData';
import { DEFAULT_LANG } from '@/const/locale';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { DiscoverService } from '@/server/services/discover';
import { translation } from '@/server/translation';
import { DiscoverPageProps } from '@/types/discover';
import { parsePageLocale } from '@/utils/locale';
import { RouteVariants } from '@/utils/server/routeVariants';

import List from '../features/List';

export const generateMetadata = async (props: DiscoverPageProps) => {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { t } = await translation('metadata', searchParams?.hl);
  const locale = await parsePageLocale(props);

  const discoverService = new DiscoverService();
  const list = await discoverService.getProviderList(locale);
  const cate = list.find((cate) => cate.identifier === params.slug);

  return metadataModule.generate({
    alternate: true,
    description: t('discover.models.description'),
    locale,
    title: [cate?.meta.title, t('discover.models.title')].join(' · '),
    url: urlJoin('/discover/models', params.slug),
  });
};

const Page = async (props: DiscoverPageProps) => {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { t } = await translation('metadata', searchParams?.hl);
  const mobile = await RouteVariants.getIsMobile(props);
  const locale = await parsePageLocale(props);

  const discoverService = new DiscoverService();
  const list = await discoverService.getProviderList(locale);
  const cate = list.find((cate) => cate.identifier === params.slug);
  const items = await discoverService.getModelCategory(locale, params.slug);

  const ld = ldModule.generate({
    description: t('discover.models.description'),
    title: [cate?.meta.title, t('discover.models.title')].join(' · '),
    url: urlJoin('/discover/models', params.slug),
    webpage: {
      enable: true,
      search: '/discover/search',
    },
  });

  return (
    <>
      <StructuredData ld={ld} />
      <List category={params.slug} items={items} mobile={mobile} />
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
