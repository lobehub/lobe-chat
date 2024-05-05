import { translation } from '@/server/translation';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return {
    title: t('tab.tts'),
  };
};

export { default } from './index';
