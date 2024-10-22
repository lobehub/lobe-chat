import StructuredData from '@/components/StructuredData';
import { DEFAULT_LANG } from '@/const/locale';
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
    description: t('discover.models.description'),
    locale,
    title: t('discover.models.title'),
    url: '/discover/models',
  });
};

const Page = async ({ searchParams }: Props) => {
  const { t, locale } = await translation('metadata', searchParams?.hl);
  const mobile = isMobileDevice();

  const discoverService = new DiscoverService();
  const items = await discoverService.getModelList(locale);

  const ld = ldModule.generate({
    description: t('discover.models.description'),
    title: t('discover.models.title'),
    url: '/discover/models',
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

export const generateStaticParams = async () => {
  const discoverService = new DiscoverService();
  const cates = await discoverService.getProviderList(DEFAULT_LANG);
  return cates.map((cate) => ({
    slug: cate,
  }));
};

Page.DisplayName = 'DiscoverModels';

export default Page;
