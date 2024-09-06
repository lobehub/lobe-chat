import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/responsive';

import Page from './index';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('tab.about'),
    url: '/settings/about',
  });
};

export default () => {
  const isMobile = isMobileDevice();

  return <Page mobile={isMobile} />;
};
