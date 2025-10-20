'use client';

import dynamic from 'next/dynamic';

import { useIsMobile } from '@/hooks/useIsMobile';

const ProfileRouter = dynamic(() => import('../ProfileRouter'), { ssr: false });

const Page = () => {
  const mobile = useIsMobile();

  return <ProfileRouter mobile={mobile} />;
};

export default Page;
