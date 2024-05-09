import { translation } from '@/server/translation';
import { ogService } from '@/services/og';
import { isMobileDevice } from '@/utils/responsive';

import Page from './index';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return ogService.generate({
    description: t('tab.about'),
    title: t('header.desc'),
    url: '/settings/about',
  });
};

export default () => {
  const isMobile = isMobileDevice();

  return <Page mobile={isMobile} />;
};
