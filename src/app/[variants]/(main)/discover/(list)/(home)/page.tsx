import StructuredData from '@/components/StructuredData';
import { Locales } from '@/locales/resources';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { DiscoverService } from '@/server/services/discover';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Client from './Client';

interface DiscoverPageProps extends DynamicLayoutProps {
  searchParams: Promise<{ hl?: Locales }>;
}

const getSharedProps = async (props: DiscoverPageProps) => {
  const searchParams = await props.searchParams;
  const hl = await RouteVariants.getLocale(props);
  const { t, locale } = await translation('metadata', searchParams?.hl || hl);
  return {
    locale,
    t,
  };
};

export const generateMetadata = async (props: DiscoverPageProps) => {
  const { locale, t } = await getSharedProps(props);
  return metadataModule.generate({
    alternate: true,
    description: t('discover.description'),
    locale,
    title: t('discover.title'),
    url: '/discover',
  });
};

const Page = async (props: DiscoverPageProps) => {
  const { locale, t } = await getSharedProps(props);
  const ld = ldModule.generate({
    description: t('discover.description'),
    locale,
    title: t('discover.title'),
    url: '/discover',
    webpage: {
      enable: true,
      search: '/discover/search',
    },
  });

  const discoverService = new DiscoverService();
  const assistantList = await discoverService.getAssistantList(locale);
  const pluginList = await discoverService.getPluginList(locale);
  const modelList = await discoverService.getModelList(locale);

  return (
    <>
      <StructuredData ld={ld} />
      <Client
        assistantList={assistantList.slice(0, 16)}
        modelList={modelList.slice(0, 8)}
        pluginList={pluginList.slice(0, 8)}
      />
    </>
  );
};

Page.DisplayName = 'Discover';

export default Page;
