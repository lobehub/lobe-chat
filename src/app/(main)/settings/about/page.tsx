import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/responsive';

import Page from './index';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return {
    title: t('tab.about'),
  };
};

export default () => {
  const isMobile = isMobileDevice();

  return <Page mobile={isMobile} />;
};
