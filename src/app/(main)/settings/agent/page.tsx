import { translation } from '@/server/translation';
import { ogService } from '@/services/og';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return ogService.generate({
    description: t('tab.agent'),
    title: t('header.desc'),
    url: '/settings/agent',
  });
};
export { default } from './index';
