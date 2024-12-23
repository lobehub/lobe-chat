import dynamic from 'next/dynamic';

import SkeletonLoading from '@/components/SkeletonLoading';
import { enableClerk } from '@/const/auth';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/server/responsive';

const ClerkProfile = dynamic(() => import('../../features/ClerkProfile'), {
  loading: () => (
    <div style={{ flex: 1 }}>
      <SkeletonLoading paragraph={{ rows: 8 }} title={false} />
    </div>
  ),
});

export const generateMetadata = async () => {
  const { t } = await translation('auth');
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('tab.profile'),
    url: '/profile',
  });
};

const Page = async () => {
  const mobile = await isMobileDevice();

  if (enableClerk) return <ClerkProfile mobile={mobile} />;

  return <div>TODO</div>;
};

export default Page;
