import { redirect } from 'next/navigation';

import StructuredData from '@/components/StructuredData';
import { Locales } from '@/locales/resources';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { DiscoverService } from '@/server/services/discover';
import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/responsive';

import List from '../../providers/features/List';

type Props = { searchParams: { hl?: Locales; q?: string } };

export const generateMetadata = async ({ searchParams }: Props) => {
  const { t } = await translation('metadata', searchParams?.hl);

  return metadataModule.generate({
    description: t('discover.description'),
    title: t('discover.search'),
    url: '/discover/search/providers',
  });
};

const Page = async ({ searchParams }: Props) => {
  const { q } = searchParams;
  if (!q) redirect(`/discover/providers`);

  const { t, locale } = await translation('metadata', searchParams?.hl);
  const mobile = isMobileDevice();

  const discoverService = new DiscoverService();
  const items = await discoverService.searchProvider(locale, q);

  const ld = ldModule.generate({
    description: t('discover.description'),
    title: t('discover.search'),
    url: '/discover/search/providers',
    webpage: {
      enable: true,
      search: true,
    },
  });

  return (
    <>
      <StructuredData ld={ld} />
      <List items={items} mobile={mobile} searchKeywords={q} />
    </>
  );
};

Page.DisplayName = 'DiscoverSearchProviders';

export default Page;
