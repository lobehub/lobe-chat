import { notFound } from 'next/navigation';

import { isDesktop } from '@/const/version';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Client from './index';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('setting', locale);

  return metadataModule.generate({
    description: t('header.desc'),
    title: t('tab.proxy'),
    url: '/settings/proxy',
  });
};

const Page = () => {
  if (!isDesktop) return notFound();

  return <Client />;
};

export default Page;
