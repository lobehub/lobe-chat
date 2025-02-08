import { notFound } from 'next/navigation';
import urlJoin from 'url-join';

import StructuredData from '@/components/StructuredData';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { DiscoverService } from '@/server/services/discover';
import { translation } from '@/server/translation';
import { DiscoverPageProps } from '@/types/discover';
import { RouteVariants } from '@/utils/server/routeVariants';

import DetailLayout from '../../features/DetailLayout';
import Actions from './features/Actions';
import Header from './features/Header';
import InfoSidebar from './features/InfoSidebar';
import ParameterList from './features/ParameterList';
import Schema from './features/Schema';

const getSharedProps = async (props: DiscoverPageProps) => {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { isMobile, locale: hl } = await RouteVariants.getVariantsFromProps(props);

  const { slug: identifier } = params;
  const { t, locale } = await translation('metadata', searchParams?.hl || hl);

  const discoverService = new DiscoverService();
  const data = await discoverService.getPluginById(locale, identifier);
  return {
    data,
    identifier,
    isMobile,
    locale,
    t,
  };
};

export const generateMetadata = async (props: DiscoverPageProps) => {
  const { data, t, locale, identifier } = await getSharedProps(props);
  if (!data) return;

  const { meta, createdAt, homepage, author } = data;

  return {
    authors: [
      { name: author, url: homepage },
      { name: 'LobeHub', url: 'https://github.com/lobehub' },
      { name: 'LobeChat', url: 'https://github.com/lobehub/lobe-chat' },
    ],
    keywords: meta.tags,
    webpage: {
      enable: true,
      search: '/discover/search',
    },
    ...metadataModule.generate({
      alternate: true,
      description: meta.description,
      locale,
      tags: meta.tags,
      title: [meta.title, t('discover.plugins.title')].join(' · '),
      url: urlJoin('/discover/plugin', identifier),
    }),
    other: {
      'article:author': author,
      'article:published_time': createdAt
        ? new Date(createdAt).toISOString()
        : new Date().toISOString(),
      'robots': 'index,follow,max-image-preview:large',
    },
  };
};

const Page = async (props: DiscoverPageProps) => {
  const { data, t, identifier, isMobile, locale } = await getSharedProps(props);
  if (!data) return notFound();

  const { meta, createdAt, author } = data;
  const ld = ldModule.generate({
    article: {
      author: [author],
      enable: true,
      identifier,
      tags: meta.tags,
    },
    date: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
    description: meta.description || t('discover.plugins.description'),
    locale,
    title: [meta.title, t('discover.plugins.title')].join(' · '),
    url: urlJoin('/discover/plugin', identifier),
  });

  return (
    <>
      <StructuredData ld={ld} />
      <DetailLayout
        actions={<Actions data={data} identifier={identifier} />}
        header={<Header data={data} identifier={identifier} mobile={isMobile} />}
        mobile={isMobile}
        sidebar={<InfoSidebar data={data} identifier={identifier} />}
        /* ↓ cloud slot ↓ */

        /* ↑ cloud slot ↑ */
      >
        <ParameterList data={data} />
        <Schema>{JSON.stringify(data.manifest.api, null, 2)}</Schema>
      </DetailLayout>
    </>
  );
};

Page.DisplayName = 'DiscoverToolsDetail';

export default Page;
