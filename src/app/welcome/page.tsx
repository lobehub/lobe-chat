import { t } from 'i18next';
import { Metadata } from 'next';

import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import Banner from './features/Banner';

export const generateMetadata = (): Metadata => ({
  title: genSiteHeadTitle(t('header', { ns: 'welcome' })),
});

const Page = () => {
  return <Banner />;
};

export default Page;
