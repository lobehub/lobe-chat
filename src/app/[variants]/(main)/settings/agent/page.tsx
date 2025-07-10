import { Skeleton } from 'antd';
import { Suspense } from 'react';

import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Page from './index';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('setting', locale);
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('tab.agent'),
    url: '/settings/agent',
  });
};

export default () => {
  return (
    <Suspense fallback={<Skeleton active paragraph={{ rows: 5 }} title={false} />}>
      <Page />
    </Suspense>
  );
};

export const dynamic = 'force-static';
