import { Divider, Skeleton } from 'antd';
import { Fragment, Suspense } from 'react';
import { Flexbox } from 'react-layout-kit';

import StructuredData from '@/components/StructuredData';
import { BRANDING_NAME } from '@/const/branding';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { changelogService } from '@/services/changelog';
import { isMobileDevice } from '@/utils/server/responsive';

import Post from './features/Post';

export const generateMetadata = async () => {
  const { t } = await translation('metadata');
  return metadataModule.generate({
    description: t('changelog.description', { appName: BRANDING_NAME }),
    title: t('changelog.title'),
    url: '/changelog',
  });
};

const Page = async () => {
  const mobile = isMobileDevice();
  const { t, locale } = await translation('metadata');
  const data = await changelogService.getChangelogIndex();

  const ld = ldModule.generate({
    description: t('changelog.description', { appName: BRANDING_NAME }),
    title: t('changelog.title', { appName: BRANDING_NAME }),
    url: '/changelog',
  });

  return (
    <>
      <StructuredData ld={ld} />
      <Flexbox gap={48}>
        {data.map((item, index) => (
          <Fragment key={item.id}>
            {!mobile && <Divider />}
            {mobile && index > 0 && <Divider />}
            <Suspense fallback={<Skeleton active paragraph={{ rows: 5 }} title={false} />}>
              <Post locale={locale} mobile={mobile} {...item} />
            </Suspense>
          </Fragment>
        ))}
      </Flexbox>
    </>
  );
};

export default Page;
