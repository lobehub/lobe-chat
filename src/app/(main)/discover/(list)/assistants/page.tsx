import StructuredData from '@/components/StructuredData';
import { Locales } from '@/locales/resources';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { DiscoverService } from '@/server/services/discover';
import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/server/responsive';

import List from './features/List';

type Props = { searchParams: { hl?: Locales } };

export const generateMetadata = async ({ searchParams }: Props) => {
  const { t, locale } = await translation('metadata', searchParams?.hl);
  return metadataModule.generate({
    alternate: true,
    description: t('discover.assistants.description'),
    locale,
    title: t('discover.assistants.title'),
    url: '/discover/assistants',
  });
};

const Page = async ({ searchParams }: Props) => {
  const { t, locale } = await translation('metadata', searchParams?.hl);
  const mobile = isMobileDevice();

  const discoverService = new DiscoverService();
  const items = await discoverService.getAssistantList(locale);

  const ld = ldModule.generate({
    description: t('discover.assistants.description'),
    title: t('discover.assistants.title'),
    url: '/discover/assistants',
    webpage: {
      enable: true,
      search: '/discover/search',
    },
  });

  return (
    <>
      <StructuredData ld={ld} />
      <List items={items} mobile={mobile} />
    </>
  );
};

Page.DisplayName = 'DiscoverAssistants';

export default Page;
