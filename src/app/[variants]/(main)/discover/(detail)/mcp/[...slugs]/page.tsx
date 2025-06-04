import { notFound } from 'next/navigation';

import { Locales } from '@/locales/resources';
import { translation } from '@/server/translation';
import { PageProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Client from './Client';

type DiscoverPageProps = PageProps<
  { slugs: string[]; variants: string },
  { hl?: Locales; version?: string }
>;

const getSharedProps = async (props: DiscoverPageProps) => {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { isMobile, locale: hl } = await RouteVariants.getVariantsFromProps(props);
  const { slugs } = params;
  const identifier = decodeURIComponent(slugs.join('/'));
  const { t, locale } = await translation('metadata', searchParams?.hl || hl);
  return {
    identifier,
    isMobile,
    locale,
    t,
  };
};

const Page = async (props: DiscoverPageProps) => {
  const { identifier, isMobile } = await getSharedProps(props);
  if (!identifier) return notFound();
  return <Client identifier={identifier} mobile={isMobile} />;
};

Page.displayName = 'MCPDetail';

export default Page;
