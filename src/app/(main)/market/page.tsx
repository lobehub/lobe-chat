import { Flexbox } from 'react-layout-kit';

import { getCanonicalUrl } from '@/const/url';
import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/responsive';

import AgentList from './features/AgentList';
import AgentSearchBar from './features/AgentSearchBar';
import TagList from './features/TagList';

export const generateMetadata = async () => {
  const { t } = await translation('common');
  return {
    alternates: { canonical: getCanonicalUrl('/market') },
    title: t('tab.market'),
  };
};

const Page = () => {
  const mobile = isMobileDevice();

  return (
    <>
      <AgentSearchBar mobile={mobile} />
      <Flexbox gap={mobile ? 16 : 24}>
        <TagList />
        <AgentList mobile={mobile} />
      </Flexbox>
    </>
  );
};

Page.DisplayName = 'Market';

export default Page;
