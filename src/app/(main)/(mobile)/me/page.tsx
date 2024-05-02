import { redirect } from 'next/navigation';
import { Center } from 'react-layout-kit';

import BrandWatermark from '@/components/BrandWatermark';
import Avatar from '@/features/AvatarWithUpload';
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
        <Avatar size={88} />
      </AvatarBanner>
      <Cate />
      <ExtraCate />
      <Center padding={16}>
        <BrandWatermark />
      </Center>
    </>
  );
};

export default Page;
