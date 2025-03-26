import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Center } from 'react-layout-kit';

import BrandWatermark from '@/components/BrandWatermark';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Category from './features/Category';
import UserBanner from './features/UserBanner';
import Loaidng from './loading';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('common', locale);
  return metadataModule.generate({
    title: t('tab.me'),
    url: '/me',
  });
};

const Page = async (props: DynamicLayoutProps) => {
  const isMobile = await RouteVariants.getIsMobile(props);

  if (!isMobile) return redirect('/chat');

  return (
    <Suspense fallback={<Loaidng />}>
      <UserBanner />
      <Category />
      <Center padding={16}>
        <BrandWatermark />
      </Center>
    </Suspense>
  );
};

Page.displayName = 'Me';

export default Page;
