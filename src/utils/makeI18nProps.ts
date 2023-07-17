import type { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import i18nextConfig from '@/../next-i18next.config';
import { NS } from '@/types/resources';

export const getI18nProps = async (ctx: any, ns: NS[] = ['common']) => {
  const locale = ctx?.params?.locale || ctx?.locale || i18nextConfig.i18n.defaultLocale;
  let props = {
    ...(await serverSideTranslations(locale, ns)),
  };
  return props;
};

export const makeI18nProps =
  (ns: NS[] = []): GetStaticProps | GetServerSideProps =>
  async (ctx: any) => ({
    props: await getI18nProps(ctx, ns),
    revalidate: false,
  });

export const getStaticPaths: GetStaticPaths = async () => {
  // We don't want to specify all possible countries as we get those from the headers
  return {
    fallback: 'blocking',
    paths: [],
  };
};
