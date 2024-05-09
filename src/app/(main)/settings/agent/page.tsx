import { translation } from '@/server/translation';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return {
    title: t('tab.agent'),
  };
};

export { default } from './index';
