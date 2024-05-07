import { redirect } from 'next/navigation';
import { Center } from 'react-layout-kit';

import BrandWatermark from '@/components/BrandWatermark';
import Divider from '@/components/Cell/Divider';
import DataStatistics from '@/features/User/DataStatistics';
import UserInfo from '@/features/User/UserInfo';
import { isMobileDevice } from '@/utils/responsive';

import AvatarBanner from './features/AvatarBanner';
import Cate from './features/Cate';
import ExtraCate from './features/ExtraCate';

const Page = () => {
  const mobile = isMobileDevice();

  if (!mobile) return redirect('/chat');

  return (
    <>
      <AvatarBanner>
        <UserInfo />
        <DataStatistics paddingInline={16} />
      </AvatarBanner>
      <Divider />
      <Cate />
      <ExtraCate />
      <Center padding={16}>
        <BrandWatermark />
      </Center>
    </>
  );
};

export default Page;
