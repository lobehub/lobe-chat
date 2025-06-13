import { notFound } from 'next/navigation';
import urlJoin from 'url-join';

import StructuredData from '@/components/StructuredData';
import { Locales } from '@/locales/resources';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { DiscoverService } from '@/server/services/discover';
import { translation } from '@/server/translation';
import { PageProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Client from './Client';

type DiscoverPageProps = PageProps<
  { slugs: string[]; variants: string },
  { hl?: Locales; version?: string }
>;

const getSharedProps = async (props: DiscoverPageProps) => {
  const [params, searchParams, { isMobile, locale: hl }] = await Promise.all([
    props.params,
    props.searchParams,
    RouteVariants.getVariantsFromProps(props),
  ]);
  const { slugs } = params;
  const identifier = decodeURIComponent(slugs.join('/'));
  const discoverService = new DiscoverService();
  const [{ t, locale }, data] = await Promise.all([
    translation('metadata', searchParams?.hl || hl),
    discoverService.getPluginDetail({ identifier, locale: hl, withManifest: false }),
  ]);
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

  const { tags, createdAt, homepage, author, description, title } = data;

  return {
    authors: [
      { name: author, url: homepage },
      { name: 'LobeHub', url: 'https://github.com/lobehub' },
      { name: 'LobeChat', url: 'https://github.com/lobehub/lobe-chat' },
    ],
    keywords: tags,
    ...metadataModule.generate({
      alternate: true,
      description: description,
      locale,
      tags: tags,
      title: [title, t('discover.plugins.title')].join(' · '),
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
  const { data, t, locale, identifier, isMobile } = await getSharedProps(props);
  if (!data) return notFound();

  const { tags, title, description, createdAt, author } = data;

  const ld = ldModule.generate({
    article: {
      author: [author],
      enable: true,
      identifier,
      tags: tags,
    },
    date: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
    description: description || t('discover.plugins.description'),
    locale,
    title: [title, t('discover.plugins.title')].join(' · '),
    url: urlJoin('/discover/plugin', identifier),
    webpage: {
      enable: true,
      search: '/discover/plugin',
    },
  });

  return (
    <>
      <StructuredData ld={ld} />
      <Client identifier={identifier} mobile={isMobile} />
    </>
  );
};

Page.DisplayName = 'DiscoverPluginsDetail';

export default Page;
