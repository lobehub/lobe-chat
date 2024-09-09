import { redirect } from 'next/navigation';

import StructuredData from '@/components/StructuredData';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { discoverService } from '@/services/discover';
import { isMobileDevice } from '@/utils/responsive';

import List from '../../assistants/features/List';

type Props = { searchParams: { hl?: string; q?: string } };

export const generateMetadata = async ({ searchParams }: Props) => {
  const { t } = await translation('metadata', searchParams?.hl);

  return metadataModule.generate({
    description: t('discover.description'),
    title: t('discover.search'),
    url: '/discover/search/assistants',
  });
};

const Page = async ({ searchParams }: Props) => {
  const { q } = searchParams;
  if (!q) redirect(`/discover/assistants`);

  const { t, locale } = await translation('metadata', searchParams?.hl);
  const mobile = isMobileDevice();

  const items = await discoverService.searchAssistant(locale, q);

  const ld = ldModule.generate({
    description: t('discover.description'),
    title: t('discover.search'),
    url: '/discover/search/assistants',
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

Page.DisplayName = 'DiscoverSearchAssistants';

export default Page;
