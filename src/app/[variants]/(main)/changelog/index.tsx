import { Divider, Skeleton } from 'antd';
import { notFound } from 'next/navigation';
import { Fragment, Suspense } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useOutletContext } from 'react-router-dom';

import Pagination from '@/app/[variants]/@modal/(.)changelog/modal/features/Pagination';
import UpdateChangelogStatus from '@/app/[variants]/@modal/(.)changelog/modal/features/UpdateChangelogStatus';
import { serverFeatureFlags } from '@/config/featureFlags';
import { Locales } from '@/locales/resources';
import { ChangelogService } from '@/server/services/changelog';

import GridLayout from './features/GridLayout';
import Post from './features/Post';

const Page = async (props: { isMobile: boolean }) => {
  const { locale } = useOutletContext<{ locale: Locales }>();
  const { isMobile } = props;
  const hideDocs = serverFeatureFlags().hideDocs;
  if (hideDocs) return notFound();
  const changelogService = new ChangelogService();
  const data = await changelogService.getChangelogIndex();

  if (!data) return notFound();

  return (
    <>
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
      <UpdateChangelogStatus currentId={data[0]?.id} />
    </>
  );
};

const DesktopPage = async () => {
  return <Page isMobile={false} />;
};

const MobilePage = async () => {
  return <Page isMobile={true} />;
};

export { DesktopPage, MobilePage };
