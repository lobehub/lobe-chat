import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';

import { enableClerk } from '@/const/auth';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/server/responsive';

import Client from '../Client';

// 为了兼容 ClerkProfile， 需要使用 [[...slug]]

const ClerkProfile = dynamic(() => import('../../features/ClerkProfile'), {
  loading: () => (
    <div style={{ flex: 1 }}>
      <Skeleton paragraph={{ rows: 8 }} title={false} />
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

  return <Client mobile={mobile} />;
};

export default Page;
