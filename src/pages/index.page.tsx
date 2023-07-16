import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export { default } from './chat/index.page';

export async function getStaticProps(context: any) {
  const { locale } = context;
  return {
    props: {
      // pass the translation props to the page component
      ...(await serverSideTranslations(locale)),
    },
  };
}
