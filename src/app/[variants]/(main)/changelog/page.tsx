import { Divider, Skeleton } from 'antd';
import { notFound } from 'next/navigation';
import { Fragment, Suspense } from 'react';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import Pagination from '@/app/[variants]/@modal/(.)changelog/modal/features/Pagination';
import StructuredData from '@/components/StructuredData';
import { serverFeatureFlags } from '@/config/featureFlags';
import { BRANDING_NAME } from '@/const/branding';
import { OFFICIAL_SITE } from '@/const/url';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { ChangelogService } from '@/server/services/changelog';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import GridLayout from './features/GridLayout';
import Post from './features/Post';

export const generateMetadata = async () => {
  const { t } = await translation('metadata');
  return metadataModule.generate({
    canonical: urlJoin(OFFICIAL_SITE, 'changelog'),
    description: t('changelog.description', { appName: BRANDING_NAME }),
    title: t('changelog.title'),
    url: '/changelog',
  });
};

const Page = async (props: DynamicLayoutProps) => {
  const hideDocs = serverFeatureFlags().hideDocs;

  if (hideDocs) return notFound();

  const isMobile = await RouteVariants.getIsMobile(props);
  const { t, locale } = await translation('metadata');
  const changelogService = new ChangelogService();
  const data = await changelogService.getChangelogIndex();

  if (!data) return notFound();

  const ld = ldModule.generate({
    description: t('changelog.description', { appName: BRANDING_NAME }),
    title: t('changelog.title', { appName: BRANDING_NAME }),
    url: '/changelog',
  });

  return (
    <>
      <StructuredData ld={ld} />
      <Flexbox gap={isMobile ? 16 : 48}>
        {data?.map((item) => (
          <Fragment key={item.id}>
            <Suspense
              fallback={
                <GridLayout>
                  <Divider />
                  <Skeleton active paragraph={{ rows: 5 }} />
                </GridLayout>
              }
            >
              <Post locale={locale} mobile={isMobile} {...item} />
            </Suspense>
          </Fragment>
        ))}
      </Flexbox>
      <GridLayout>
        <Pagination />
      </GridLayout>
    </>
  );
};

export default Page;
