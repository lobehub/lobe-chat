import StructuredData from '@/components/StructuredData';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { discoverService } from '@/services/discover';
import { isMobileDevice } from '@/utils/responsive';

import List from './features/List';

type Props = { searchParams: { hl?: string } };

export const generateMetadata = async ({ searchParams }: Props) => {
  const { t } = await translation('metadata', searchParams?.hl);

  return metadataModule.generate({
    description: t('discover.models.description'),
    title: t('discover.models.title'),
    url: '/discover/models',
  });
};

const Page = async ({ searchParams }: Props) => {
  const { t, locale } = await translation('metadata', searchParams?.hl);
  const mobile = isMobileDevice();

  const items = await discoverService.getModelList(locale);

  const ld = ldModule.generate({
    description: t('discover.models.description'),
    title: t('discover.models.title'),
    url: '/discover/models',
    webpage: {
      enable: true,
      search: true,
    },
  });

  return (
    <>
      <StructuredData ld={ld} />
      <List items={items} mobile={mobile} />
    </>
  );
};

export const generateStaticParams = async () => {
  const cates = await discoverService.getProviderList('en');
  return cates.map((cate) => ({
    slug: cate,
  }));
};

Page.DisplayName = 'DiscoverModels';

export default Page;
