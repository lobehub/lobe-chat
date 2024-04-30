import { Flexbox } from 'react-layout-kit';

import { getCanonicalUrl } from '@/const/url';
import { translation } from '@/server/translation';
import { isMobileDevice } from '@/utils/responsive';

import AgentList from './features/AgentList';
import AgentSearchBar from './features/AgentSearchBar';
import TagList from './features/TagList';

type Props = { searchParams: { q?: string } };

export const generateMetadata = async () => {
  const { t } = await translation('common');
  return {
    alternates: { canonical: getCanonicalUrl('/market') },
    title: t('tab.market'),
  };
};

const Page = ({ searchParams }: Props) => {
  const mobile = isMobileDevice();
  const defaultKeywords = searchParams?.q || '';

  return (
    <>
      <AgentSearchBar defaultKeyword={defaultKeywords} mobile={mobile} />
      <Flexbox gap={mobile ? 16 : 24}>
        <TagList keywords={defaultKeywords} />
        <AgentList keywords={defaultKeywords} mobile={mobile} />
      </Flexbox>
    </>
  );
};

Page.DisplayName = 'Market';

export default Page;
