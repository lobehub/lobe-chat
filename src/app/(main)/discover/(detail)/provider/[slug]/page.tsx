import { notFound } from 'next/navigation';
import urlJoin from 'url-join';

import StructuredData from '@/components/StructuredData';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { discoverService } from '@/services/discover';
import { isMobileDevice } from '@/utils/responsive';

import DetailLayout from '../../features/DetailLayout';
import Actions from './features/Actions';
import Header from './features/Header';
import InfoSidebar from './features/InfoSidebar';
import ModelList from './features/ModelList';

type Props = { params: { slug: string }; searchParams: { hl?: string } };

export const generateMetadata = async ({ params, searchParams }: Props) => {
  const { slug: identifier } = params;
  const { t, locale } = await translation('metadata', searchParams?.hl);

  const data = await discoverService.getProviderById(locale, identifier);
  if (!data) return notFound();

  const { meta, createdAt, models } = data;

  return {
    authors: [
      { name: meta.title },
      { name: 'LobeHub', url: 'https://github.com/lobehub' },
      { name: 'LobeChat', url: 'https://github.com/lobehub/lobe-chat' },
    ],
    ...metadataModule.generate({
      description: meta.description || t('discover.providers.description'),
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
  const mobile = isMobileDevice();

  const data = await discoverService.getProviderById(locale, identifier);
  if (!data) return notFound();

  const modelData = await discoverService.getModelByIds(locale, data.models);

  const { meta, createdAt, models } = data;
  const ld = ldModule.generate({
    article: {
      author: [meta.title],
      enable: true,
      identifier,
      tags: models || [],
    },
    date: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
    description: meta.description || t('discover.providers.description'),
    title: [meta.title, t('discover.providers.title')].join(' · '),
    url: urlJoin('/discover/provider', identifier),
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
        <ModelList data={modelData} identifier={identifier} />
      </DetailLayout>
    </>
  );
};

Page.DisplayName = 'DiscoverProviderDetail';

export default Page;
