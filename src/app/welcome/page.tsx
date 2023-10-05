import { t } from 'i18next';
import { Metadata } from 'next';

import Banner from './features/Banner';

export const generateMetadata = (): Metadata => ({
  title: t('header', { ns: 'welcome' }),
});

const Page = () => <Banner />;

export default Page;
