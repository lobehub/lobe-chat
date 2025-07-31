import StructuredData from '@/components/StructuredData';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { DynamicLayoutProps } from '@/types/next';
import { parsePageMetaProps } from '@/utils/server/pageProps';

import Client from './Client';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const { locale, t } = await parsePageMetaProps(props);
  return metadataModule.generate({
    alternate: true,
    description: t('discover.models.description'),
    locale,
    title: t('discover.models.title'),
    url: '/discover/model',
  });
};

const Page = async (props: DynamicLayoutProps) => {
  const { locale, t } = await parsePageMetaProps(props);

  const ld = ldModule.generate({
    description: t('discover.models.description'),
    locale,
    title: t('discover.models.title'),
    url: '/discover/model',
    webpage: {
      enable: true,
      search: '/discover/model',
    },
  });

  return (
    <>
      <StructuredData ld={ld} />
      <Client />
    </>
  );
};

Page.DisplayName = 'DiscoverModels';

export default Page;
