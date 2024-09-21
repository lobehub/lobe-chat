import { notFound } from 'next/navigation';
import urlJoin from 'url-join';

import StructuredData from '@/components/StructuredData';
import { CustomMDX } from '@/components/mdx';
import { Locales } from '@/locales/resources';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { DiscoverService } from '@/server/services/discover';
import { DocService } from '@/server/services/doc';
import { translation } from '@/server/translation';
import { DiscoverModelItem } from '@/types/discover';
import { isMobileDevice } from '@/utils/responsive';

import DetailLayout from '../../features/DetailLayout';
import Actions from './features/Actions';
import Header from './features/Header';
import InfoSidebar from './features/InfoSidebar';
import ModelList from './features/ModelList';

type Props = { params: { slug: string }; searchParams: { hl?: Locales } };

export const generateMetadata = async ({ params, searchParams }: Props) => {
  const { slug: identifier } = params;
  const { t, locale } = await translation('metadata', searchParams?.hl);
  const { t: td } = await translation('models', searchParams?.hl);

  const discoverService = new DiscoverService();
  const data = await discoverService.getProviderById(locale, identifier);
  if (!data) return;

  const { meta, createdAt, models } = data;

  return {
    authors: [
      { name: meta.title },
      { name: 'LobeHub', url: 'https://github.com/lobehub' },
      { name: 'LobeChat', url: 'https://github.com/lobehub/lobe-chat' },
    ],
    ...metadataModule.generate({
      alternate: true,
      description: td(`${identifier}.description`) || t('discover.providers.description'),
      locale,
      tags: models || [],
      title: [meta.title, t('discover.providers.title')].join(' · '),
      url: urlJoin('/discover/provider', identifier),
    }),
    other: {
      'article:author': meta.title,
      'article:published_time': createdAt
        ? new Date(createdAt).toISOString()
        : new Date().toISOString(),
      'robots': 'index,follow,max-image-preview:large',
    },
  };
};

const Page = async ({ params, searchParams }: Props) => {
  const { slug: identifier } = params;
  const { t, locale } = await translation('metadata', searchParams?.hl);
  const { t: td } = await translation('models', searchParams?.hl);
  const mobile = isMobileDevice();

  const discoverService = new DiscoverService();
  const data = await discoverService.getProviderById(locale, identifier);
  if (!data) return notFound();

  const docService = new DocService();

  const { meta, createdAt, models } = data;

  let modelData: DiscoverModelItem[] = [];
  if (models && models?.length > 0) {
    modelData = await discoverService.getModelByIds(locale, models);
  }

  const doc = await docService.getDocByPath(locale, `usage/providers/${identifier}`);

  const ld = ldModule.generate({
    article: {
      author: [meta.title],
      enable: true,
      identifier,
      tags: models || [],
    },
    date: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
    description: td(`${identifier}.description`) || t('discover.providers.description'),
    title: [meta.title, t('discover.providers.title')].join(' · '),
    url: urlJoin('/discover/provider', identifier),
    webpage: {
      enable: true,
      search: '/discover/search',
    },
  });

  return (
    <>
      <StructuredData ld={ld} />
      <DetailLayout
        actions={<Actions data={data} identifier={identifier} />}
        header={<Header data={data} identifier={identifier} mobile={mobile} />}
        mobile={mobile}
        sidebar={<InfoSidebar data={data} identifier={identifier} />}
        /* ↓ cloud slot ↓ */

        /* ↑ cloud slot ↑ */
      >
        <ModelList identifier={identifier} mobile={mobile} modelData={modelData} />
        {doc && <CustomMDX mobile={mobile} source={doc.content} />}
      </DetailLayout>
    </>
  );
};

Page.DisplayName = 'DiscoverProviderDetail';

export default Page;
