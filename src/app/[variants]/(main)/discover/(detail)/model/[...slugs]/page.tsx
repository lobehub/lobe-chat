import { notFound } from 'next/navigation';
import urlJoin from 'url-join';

import StructuredData from '@/components/StructuredData';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { DiscoverService } from '@/server/services/discover';
import { translation } from '@/server/translation';
import { PageProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Client from './Client';

type DiscoverPageProps = PageProps<{ slugs: string[]; variants: string }>;

const getSharedProps = async (props: DiscoverPageProps) => {
  const params = await props.params;
  const { isMobile, locale: hl } = await RouteVariants.getVariantsFromProps(props);

  const { slugs } = params;
  const identifier = decodeURIComponent(slugs.join('/'));
  const { t, locale } = await translation('metadata', hl);
  const { t: td } = await translation('models', hl);

  const discoverService = new DiscoverService();
  const data = await discoverService.getModelDetail({ identifier });
  return {
    data,
    discoverService,
    identifier,
    isMobile,
    locale,
    t,
    td,
  };
};

export const generateMetadata = async (props: DiscoverPageProps) => {
  const { data, locale, identifier, t, td } = await getSharedProps(props);
  if (!data) return;

  const { displayName, releasedAt, providers } = data;

  return {
    authors: [
      { name: displayName || identifier },
      { name: 'LobeHub', url: 'https://github.com/lobehub' },
      { name: 'LobeChat', url: 'https://github.com/lobehub/lobe-chat' },
    ],
    webpage: {
      enable: true,
      search: true,
    },
    ...metadataModule.generate({
      alternate: true,
      description: td(`${identifier}.description`) || t('discover.models.description'),
      locale,
      tags: providers.map((item) => item.name) || [],
      title: [displayName || identifier, t('discover.models.title')].join(' · '),
      url: urlJoin('/discover/model', identifier),
    }),
    other: {
      'article:author': displayName || identifier,
      'article:published_time': releasedAt
        ? new Date(releasedAt).toISOString()
        : new Date().toISOString(),
      'robots': 'index,follow,max-image-preview:large',
    },
  };
};

export const generateStaticParams = async () => [];

const Page = async (props: DiscoverPageProps) => {
  const { data, locale, identifier, t, td, isMobile } = await getSharedProps(props);
  if (!data) return notFound();

  const { displayName, releasedAt, providers } = data;

  const ld = ldModule.generate({
    article: {
      author: [displayName || identifier],
      enable: true,
      identifier,
      tags: providers.map((item) => item.name) || [],
    },
    date: releasedAt ? new Date(releasedAt).toISOString() : new Date().toISOString(),
    description: td(`${identifier}.description`) || t('discover.models.description'),
    locale,
    title: [displayName || identifier, t('discover.models.title')].join(' · '),
    url: urlJoin('/discover/model', identifier),
  });

  return (
    <>
      <StructuredData ld={ld} />
      <Client identifier={identifier} mobile={isMobile} />
    </>
  );
};

Page.DisplayName = 'DiscoverModelDetail';

export default Page;
