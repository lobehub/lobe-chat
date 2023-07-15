import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Chat from './chat/index.page';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Index = (_props: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <Chat />;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'zh_CN', ['common'])),
  },
});

export default Index;
