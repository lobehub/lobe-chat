import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('tab.agent'),
    url: '/settings/agent',
  });
};
export { default } from './index';
