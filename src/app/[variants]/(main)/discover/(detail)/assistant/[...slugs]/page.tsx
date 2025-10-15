import { notFound } from 'next/navigation';
import urlJoin from 'url-join';

import StructuredData from '@/components/StructuredData';
import { Locales } from '@/locales/resources';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { DiscoverService } from '@/server/services/discover';
import { translation } from '@/server/translation';
import { AssistantMarketSource, DiscoverTab } from '@/types/discover';
import { PageProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Breadcrumb from '../../features/Breadcrumb';
import Client from './Client';

type DiscoverPageProps = PageProps<
  { slugs: string[]; variants: string },
  { hl?: Locales; source?: AssistantMarketSource; version?: string }
>;

const isUrl = (value?: string | null) => (value ? /^https?:\/\//.test(value) : false);

const getSharedProps = async (props: DiscoverPageProps) => {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { slugs } = params;
  const identifier = decodeURIComponent(slugs.join('/'));
  const { isMobile, locale: hl } = await RouteVariants.getVariantsFromProps(props);
  const marketSource = searchParams?.source as AssistantMarketSource | undefined;
  const discoverService = new DiscoverService();
  const [{ t, locale }, data] = await Promise.all([
    translation('metadata', hl),
    discoverService.getAssistantDetail({ identifier, locale: hl, source: marketSource }),
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
  const authorString = typeof author === 'string' ? author : undefined;
  const authorName =
    authorString && !isUrl(authorString)
      ? authorString
      : author && typeof author === 'object' && 'name' in author
        ? String((author as { name?: unknown }).name ?? '')
        : 'Unknown';
  const authorHomepage = isUrl(authorString)
    ? authorString
    : author &&
        typeof author === 'object' &&
        'url' in author &&
        typeof (author as { url?: unknown }).url === 'string'
      ? String((author as { url?: unknown }).url)
      : homepage;

  return {
    authors: [
      { name: authorName, url: authorHomepage },
      { name: 'LobeHub', url: 'https://github.com/lobehub' },
      { name: 'LobeChat', url: 'https://github.com/lobehub/lobe-chat' },
    ],
    keywords: tags,
    ...metadataModule.generate({
      alternate: true,
      canonical: urlJoin('https://lobehub.com/agent', identifier),
      description: description,
      locale,
      tags: tags,
      title: [title, t('discover.assistants.title')].join(' · '),
      url: urlJoin('/discover/assistant', identifier),
    }),
    other: {
      'article:author': authorName,
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
  const authorString = typeof author === 'string' ? author : undefined;
  const authorName =
    authorString && !isUrl(authorString)
      ? authorString
      : author && typeof author === 'object' && 'name' in author
        ? String((author as { name?: unknown }).name ?? '')
        : 'Unknown';

  const ld = ldModule.generate({
    article: {
      author: authorName ? [authorName] : [],
      enable: true,
      identifier,
      tags: tags,
    },
    date: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
    description: description || t('discover.assistants.description'),
    locale,
    title: [title, t('discover.assistants.title')].join(' · '),
    url: urlJoin('/discover/assistant', identifier),
    webpage: {
      enable: true,
      search: '/discover/assistant',
    },
  });

  return (
    <>
      <StructuredData ld={ld} />
      {!isMobile && <Breadcrumb identifier={identifier} tab={DiscoverTab.Assistants} />}
      <Client identifier={identifier} mobile={isMobile} />
    </>
  );
};

export const generateStaticParams = async () => [];

Page.DisplayName = 'DiscoverAssistantsDetail';

export default Page;
