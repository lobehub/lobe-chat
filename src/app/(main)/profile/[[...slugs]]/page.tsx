import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/responsive';

import Client from './Client';

export const generateMetadata = async () => {
  const { t } = await translation('common');
  return {
    title: t('userButton.profile'),
  };
};

const Page = () => {
  const mobile = isMobileDevice();
  return <Client mobile={mobile} />;
};

export default Page;
