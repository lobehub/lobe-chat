import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export { default } from './[id]/index.page';

export const getStaticPaths = async (context: any) => ({
  props: await serverSideTranslations(context.locale),
});
