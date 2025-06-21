import StructuredData from '@/components/StructuredData';
import { Locales } from '@/locales/resources';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Client from './Client';

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
    canonical: 'https://lobehub.com/mcp',
    description: t('discover.plugins.description'),
    locale,
    title: t('discover.plugins.title'),
    url: '/discover/mcp',
  });
};

const Page = async (props: DiscoverPageProps) => {
  const { locale, t, isMobile } = await getSharedProps(props);

  const ld = ldModule.generate({
    description: t('discover.plugins.description'),
    locale,
    title: t('discover.plugins.title'),
    url: '/discover/mcp',
    webpage: {
      enable: true,
      search: '/discover/mcp',
    },
  });

  return (
    <>
      <StructuredData ld={ld} />
      <Client mobile={isMobile} />
    </>
  );
};

Page.DisplayName = 'DiscoverMCP';

export default Page;
