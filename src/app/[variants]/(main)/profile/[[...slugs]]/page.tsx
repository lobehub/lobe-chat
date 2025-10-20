'use client';

import dynamic from 'next/dynamic';

import BrandTextLoading from '@/components/Loading/BrandTextLoading';
import { useIsMobile } from '@/hooks/useIsMobile';

const ProfileRouter = dynamic(() => import('../ProfileRouter'), {
  loading: BrandTextLoading,
  ssr: false,
});

const Page = () => {
  const mobile = useIsMobile();

  return <ProfileRouter mobile={mobile} />;
};

export default Page;
