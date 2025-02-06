import StructuredData from '@/components/StructuredData';
import { Locales } from '@/locales/resources';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { DiscoverService } from '@/server/services/discover';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { parsePageLocale } from '@/utils/locale';

import Client from './Client';

interface Props extends DynamicLayoutProps {
  searchParams: Promise<{ hl?: Locales }>;
}

export const generateMetadata = async (props: Props) => {
  const searchParams = await props.searchParams;
  const { t } = await translation('metadata', searchParams?.hl);
  const locale = await parsePageLocale(props);
  return metadataModule.generate({
    alternate: true,
    description: t('discover.description'),
    locale,
    title: t('discover.title'),
    url: '/discover',
  });
};

const Page = async (props: Props) => {
  const searchParams = await props.searchParams;
  const { t } = await translation('metadata', searchParams?.hl);
  const locale = await parsePageLocale(props);

  const ld = ldModule.generate({
    description: t('discover.description'),
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
