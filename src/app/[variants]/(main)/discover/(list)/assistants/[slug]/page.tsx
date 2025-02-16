import urlJoin from 'url-join';

import StructuredData from '@/components/StructuredData';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { DiscoverService } from '@/server/services/discover';
import { translation } from '@/server/translation';
import { AssistantCategory, DiscoverPageProps } from '@/types/discover';
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
    description: t('discover.assistants.description'),
    locale,
    title: [td(`category.assistant.${category}`), t('discover.assistants.title')].join(' · '),
    url: urlJoin('/discover/assistants', category),
  });
};

const Page = async (props: DiscoverPageProps<AssistantCategory>) => {
  const { locale, t, td, category, isMobile } = await getSharedProps(props);

  const discoverService = new DiscoverService();
  const items = await discoverService.getAssistantCategory(locale, category as AssistantCategory);

  const ld = ldModule.generate({
    description: t('discover.assistants.description'),
    locale,
    title: [td(`category.assistant.${category}`), t('discover.assistants.title')].join(' · '),
    url: urlJoin('/discover/assistants', category),
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
  const cates = Object.values(AssistantCategory);
  return cates.map((cate) => ({
    slug: cate,
  }));
};

Page.DisplayName = 'DiscoverAssistantsCategory';

export default Page;
