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

type DiscoverPageProps = PageProps<{ slugs: string[]; variants: string }, { version?: string }>;

const getSharedProps = async (props: DiscoverPageProps) => {
  const [params, { isMobile, locale: hl }] = await Promise.all([
    props.params,
    RouteVariants.getVariantsFromProps(props),
  ]);
  const { slugs } = params;
  const identifier = decodeURIComponent(slugs.join('/'));
  const discoverService = new DiscoverService();
  const [{ t, locale }, { t: td }, data] = await Promise.all([
    translation('metadata', hl),
    translation('providers', hl),
    discoverService.getProviderDetail({ identifier }),
  ]);
  return {
    data,
    identifier,
    isMobile,
    locale,
    t,
    td,
  };
};

export const generateMetadata = async (props: DiscoverPageProps) => {
  const { data, t, td, locale, identifier } = await getSharedProps(props);
  if (!data) return;

  const { name, models = [] } = data;

  return {
    authors: [
      { name: name },
      { name: 'LobeHub', url: 'https://github.com/lobehub' },
      { name: 'LobeChat', url: 'https://github.com/lobehub/lobe-chat' },
    ],
    ...metadataModule.generate({
      alternate: true,
      description: td(`${identifier}.description`) || t('discover.providers.description'),
      locale,
      tags: models.map((item) => item.displayName || item.id) || [],
      title: [name, t('discover.providers.title')].join(' · '),
      url: urlJoin('/discover/provider', identifier),
    }),
    other: {
      'article:author': name,
      'article:published_time': new Date().toISOString(),
      'robots': 'index,follow,max-image-preview:large',
    },
  };
};

export const generateStaticParams = async () => [];

const Page = async (props: DiscoverPageProps) => {
  const { data, t, td, locale, identifier, isMobile } = await getSharedProps(props);
  if (!data) return notFound();

  const { models, name } = data;

  const ld = ldModule.generate({
    article: {
      author: [name],
      enable: true,
      identifier,
      tags: models.map((item) => item.displayName || item.id) || [],
    },
    date: new Date().toISOString(),
    description: td(`${identifier}.description`) || t('discover.providers.description'),
    locale,
    title: [name, t('discover.providers.title')].join(' · '),
    url: urlJoin('/discover/provider', identifier),
    webpage: {
      enable: true,
      search: true,
    },
  });

  return (
    <>
      <StructuredData ld={ld} />
      <Client identifier={identifier} mobile={isMobile} />
    </>
  );
};

Page.DisplayName = 'DiscoverProviderDetail';

export default Page;
