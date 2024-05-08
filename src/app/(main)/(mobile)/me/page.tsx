import { redirect } from 'next/navigation';
import { Center } from 'react-layout-kit';

import BrandWatermark from '@/components/BrandWatermark';
import Divider from '@/components/Cell/Divider';
import DataStatistics from '@/features/User/DataStatistics';
import UserInfo from '@/features/User/UserInfo';
import { isMobileDevice } from '@/utils/responsive';

import Cate from './features/Cate';
import ExtraCate from './features/ExtraCate';

const Page = () => {
  const mobile = isMobileDevice();

  if (!mobile) return redirect('/chat');

  return (
    <>
      <UserInfo />
      <DataStatistics paddingInline={12} style={{ paddingBottom: 6 }} />
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
