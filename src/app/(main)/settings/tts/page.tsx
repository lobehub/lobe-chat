import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return metadataModule.generate({
    description: t('tab.tts'),
    title: t('header.desc'),
    url: '/settings/tts',
  });
};
export { default } from './index';
