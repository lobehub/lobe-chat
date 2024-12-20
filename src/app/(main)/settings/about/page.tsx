import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/server/responsive';

import Page from './index';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('tab.about'),
    url: '/settings/about',
  });
};

export default async () => {
  const isMobile = await isMobileDevice();

  return <Page mobile={isMobile} />;
};
