import { redirect } from 'next/navigation';
import { Center } from 'react-layout-kit';

import BrandWatermark from '@/components/BrandWatermark';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Category from './features/Category';
import UserBanner from './features/UserBanner';

export const generateMetadata = async () => {
  const { t } = await translation('common');
  return metadataModule.generate({
    title: t('tab.me'),
    url: '/me',
  });
};

const Page = async (props: DynamicLayoutProps) => {
  const isMobile = await RouteVariants.getIsMobile(props);

  if (!isMobile) return redirect('/chat');

  return (
    <>
      <UserBanner />
      <Category />
      <Center padding={16}>
        <BrandWatermark />
      </Center>
    </>
  );
};

Page.displayName = 'Me';

export default Page;

export const dynamic = 'force-static';
