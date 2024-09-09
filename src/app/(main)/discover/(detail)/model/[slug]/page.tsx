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
import ParameterList from './features/ParameterList';
import ProviderList from './features/ProviderList';

type Props = { params: { slug: string }; searchParams: { hl?: string } };

export const generateMetadata = async ({ params, searchParams }: Props) => {
  const { slug: identifier } = params;
  const { t, locale } = await translation('metadata', searchParams?.hl);

  const data = await discoverService.getModelById(locale, identifier);

  if (!data) return notFound();

  const { meta, createdAt, providers } = data;

  return {
    authors: [
      { name: meta.title },
      { name: 'LobeHub', url: 'https://github.com/lobehub' },
      { name: 'LobeChat', url: 'https://github.com/lobehub/lobe-chat' },
    ],
    ...metadataModule.generate({
      description: meta.description || t('discover.models.description'),
      tags: providers || [],
      title: [meta.title, t('discover.models.title')].join(' · '),
      url: urlJoin('/discover/model', identifier),
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

  const data = await discoverService.getModelById(locale, identifier);
  if (!data) return notFound();

  const { meta, createdAt, providers } = data;
  const ld = ldModule.generate({
    article: {
      author: [meta.title],
      enable: true,
      identifier,
      tags: providers || [],
    },
    date: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
    description: meta.description || t('discover.models.description'),
    title: [meta.title, t('discover.models.title')].join(' · '),
    url: urlJoin('/discover/model', identifier),
  });

  return (
    <>
      <StructuredData ld={ld} />
      <DetailLayout
        actions={<Actions data={data} identifier={identifier} />}
        header={<Header data={data} identifier={identifier} mobile={mobile} />}
        mobile={mobile}
        sidebar={<InfoSidebar data={data} identifier={identifier} mobile={mobile} />}
        /* ↓ cloud slot ↓ */
        /* ↑ cloud slot ↑ */
      >
        <ProviderList data={data} identifier={identifier} />
        <ParameterList data={data} identifier={identifier} />
      </DetailLayout>
    </>
  );
};

Page.DisplayName = 'DiscoverModelDetail';

export default Page;
