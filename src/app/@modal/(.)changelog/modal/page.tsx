import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { serverFeatureFlags } from '@/config/featureFlags';
import { ChangelogService } from '@/server/services/changelog';
import { getLocale } from '@/server/translation';
import { isMobileDevice } from '@/utils/server/responsive';

import Post from './features/Post';
import UpdateChangelogStatus from './features/UpdateChangelogStatus';
import Loading from './loading';

const Page = async () => {
  const hideDocs = serverFeatureFlags().hideDocs;

  if (hideDocs) return notFound();

  const locale = await getLocale();
  const mobile = await isMobileDevice();
  const changelogService = new ChangelogService();
  const data = await changelogService.getChangelogIndex();

  if (!data) return notFound();

  return (
    <>
      {data?.map((item) => (
        <Suspense fallback={<Loading />} key={item.id}>
          <Post locale={locale} mobile={mobile} {...item} />
        </Suspense>
      ))}
      <UpdateChangelogStatus currentId={data[0]?.id} />
    </>
  );
};

Page.displayName = 'ChangelogModal';

export default Page;
