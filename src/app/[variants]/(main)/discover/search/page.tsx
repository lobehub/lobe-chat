import { redirect } from 'next/navigation';
import urlJoin from 'url-join';

import StructuredData from '@/components/StructuredData';
import { Locales } from '@/locales/resources';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { PageProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import AssistantsResult from './features/AssistantsResult';
import ModelsResult from './features/ModelsResult';
import PluginsResult from './features/PluginsResult';
import ProvidersResult from './features/ProvidersResult';

type Props = PageProps<
  { variants: string },
  {
    hl?: Locales;
    q?: string;
    type?: 'assistants' | 'plugins' | 'models' | 'providers';
  }
>;

export const generateMetadata = async (props: Props) => {
  const searchParams = await props.searchParams;

  const { t, locale } = await translation('metadata', searchParams?.hl);

  return metadataModule.generate({
    alternate: true,
    description: t('discover.description'),
    locale,
    title: t('discover.search'),
    url: '/discover/search',
  });
};

const Page = async (props: Props) => {
  const searchParams = await props.searchParams;

  const { q, type = 'assistants' } = searchParams;
  if (!q) redirect(urlJoin(`/discover`, type));
  const keywords = decodeURIComponent(q);

  const { t, locale } = await translation('metadata', searchParams?.hl);
  const mobile = await RouteVariants.getIsMobile(props);

  const ld = ldModule.generate({
    description: t('discover.description'),
    title: t('discover.search'),
    url: '/discover/search',
    webpage: {
      enable: true,
      search: '/discover/search',
    },
  });

  return (
    <>
      <StructuredData ld={ld} />
      {type === 'assistants' && <AssistantsResult locale={locale} mobile={mobile} q={keywords} />}
      {type === 'plugins' && <PluginsResult locale={locale} mobile={mobile} q={keywords} />}
      {type === 'models' && <ModelsResult locale={locale} mobile={mobile} q={keywords} />}
      {type === 'providers' && <ProvidersResult locale={locale} mobile={mobile} q={keywords} />}
    </>
  );
};

Page.DisplayName = 'DiscoverSearch';

export default Page;
