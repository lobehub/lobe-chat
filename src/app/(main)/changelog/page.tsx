import { Divider, Skeleton } from 'antd';
import { notFound } from 'next/navigation';
import { Fragment, Suspense } from 'react';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import Pagination from '@/app/@modal/(.)changelog/modal/features/Pagination';
import StructuredData from '@/components/StructuredData';
import { serverFeatureFlags } from '@/config/featureFlags';
import { BRANDING_NAME } from '@/const/branding';
import { OFFICIAL_SITE } from '@/const/url';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { ChangelogService } from '@/server/services/changelog';
import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/server/responsive';

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

const Page = async () => {
  const hideDocs = serverFeatureFlags().hideDocs;

  if (hideDocs) return notFound();

  const mobile = await isMobileDevice();
  const { t, locale } = await translation('metadata');
  const changelogService = new ChangelogService();
  const data = await changelogService.getChangelogIndex();

  const ld = ldModule.generate({
    description: t('changelog.description', { appName: BRANDING_NAME }),
    title: t('changelog.title', { appName: BRANDING_NAME }),
    url: '/changelog',
  });

  return (
    <>
      <StructuredData ld={ld} />
      <Flexbox gap={mobile ? 16 : 48}>
        {data.map((item) => (
          <Fragment key={item.id}>
            <Suspense
              fallback={
                <GridLayout>
                  <Divider />
                  <Skeleton active paragraph={{ rows: 5 }} />
                </GridLayout>
              }
            >
              <Post locale={locale} mobile={mobile} {...item} />
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
