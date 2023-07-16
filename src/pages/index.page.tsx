import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export { default } from './chat/index.page';
export const getStaticProps = async (context: any) => ({
  props: await serverSideTranslations(context.locale, ['common', 'setting']),
});
