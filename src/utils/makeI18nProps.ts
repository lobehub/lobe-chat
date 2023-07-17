import type { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import i18nextConfig from '@/../next-i18next.config';
import { NS } from '@/types/resources';

const isServerReq = (req: any) => !req?.url?.startsWith('/_next');

export const getI18nProps = async (ctx: any, ns: NS[] = ['common']) => {
  const locale = ctx?.params?.locale || ctx?.locale || i18nextConfig.i18n.defaultLocale;
  const req = ctx?.params?.req || ctx?.req;
  return isServerReq(req) ? await serverSideTranslations(locale, ns) : {};
};

export const makeI18nProps =
  (ns: NS[] = []): GetStaticProps | GetServerSideProps =>
  async (ctx: any) => {
    const req = ctx?.params?.req || ctx?.req;
    return {
      props: isServerReq(req) ? await getI18nProps(ctx, ns) : {},
      revalidate: false,
    };
  };

export const getStaticPaths: GetStaticPaths = async () => {
  // We don't want to specify all possible countries as we get those from the headers
  return {
    fallback: 'blocking',
    paths: [],
  };
};
