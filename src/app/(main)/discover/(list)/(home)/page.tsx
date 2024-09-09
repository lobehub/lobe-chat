import StructuredData from '@/components/StructuredData';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { discoverService } from '@/services/discover';

import Client from './Client';

type Props = { searchParams: { hl?: string } };

export const generateMetadata = async ({ searchParams }: Props) => {
  const { t } = await translation('metadata', searchParams?.hl);
  return metadataModule.generate({
    description: t('discover.description'),
    title: t('discover.title'),
    url: '/discover',
  });
};

const Page = async ({ searchParams }: Props) => {
  const { t, locale } = await translation('metadata', searchParams?.hl);
  const ld = ldModule.generate({
    description: t('discover.description'),
    title: t('discover.title'),
    url: '/discover',
  });

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
