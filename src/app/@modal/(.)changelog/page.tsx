import { Suspense } from 'react';

import { ChangelogService } from '@/server/services/changelog';
import { getLocale } from '@/server/translation';
import { isMobileDevice } from '@/utils/server/responsive';

import Post from './features/Post';
import Loading from './loading';

const Page = async () => {
  const locale = await getLocale();
  const mobile = isMobileDevice();
  const changelogService = new ChangelogService();
  const data = await changelogService.getChangelogIndex();

  return data.map((item) => (
    <Suspense fallback={<Loading />} key={item.id}>
      <Post locale={locale} mobile={mobile} {...item} />
    </Suspense>
  ));
};

Page.displayName = 'ChangelogModal';

export default Page;
