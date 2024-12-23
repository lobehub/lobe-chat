import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';

export const generateMetadata = async () => {
  const { t } = await translation('auth');
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('tab.stats'),
    url: '/profile/stats',
  });
};

const Page = async () => {
  return <div>TODO</div>;
};

export default Page;
