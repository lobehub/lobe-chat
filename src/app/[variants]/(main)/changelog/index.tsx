import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import useSWR from 'swr';

import NotFound from '@/components/404';
import type { Locales } from '@/locales/resources';
import { ChangelogService } from '@/server/services/changelog';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import GridLayout from './features/GridLayout';
import Pagination from './features/Pagination';
import Post from './features/Post';
import UpdateChangelogStatus from './features/UpdateChangelogStatus';

const Page = (props: { isMobile: boolean }) => {
  const { i18n } = useTranslation();
  const locale = i18n.language as Locales;
  const { isMobile } = props;
  const { hideDocs } = useServerConfigStore(featureFlagsSelectors);

  const { data = [] } = useSWR('changelog-index', async () => {
    const changelogService = new ChangelogService();
    return await changelogService.getChangelogIndex();
  });

  if (hideDocs) return <NotFound />;

  if (!data) return <NotFound />;

  return (
    <>
      <Flexbox gap={isMobile ? 16 : 48}>
        {data?.map((item) => (
          <Fragment key={item.id}>
            <Post locale={locale} mobile={isMobile} {...item} />
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

const DesktopPage = () => {
  return <Page isMobile={false} />;
};

const MobilePage = () => {
  return <Page isMobile={true} />;
};

export { DesktopPage, MobilePage };
