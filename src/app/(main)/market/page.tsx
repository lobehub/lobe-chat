import { Flexbox } from 'react-layout-kit';

import StructuredData from '@/components/StructuredData';
import { translation } from '@/server/translation';
import { ldServices } from '@/services/ld';
import { ogService } from '@/services/og';
import { isMobileDevice } from '@/utils/responsive';

import AgentList from './features/AgentList';
import AgentSearchBar from './features/AgentSearchBar';
import TagList from './features/TagList';

export const generateMetadata = async () => {
  const { t } = await translation('metadata');
  return ogService.generate({
    description: t('market.description'),
    title: t('market.title'),
    url: '/market',
  });
};

const Page = async () => {
  const mobile = isMobileDevice();
  const { t } = await translation('metadata');
  const ld = ldServices.generate({
    description: t('market.description'),
    title: t('market.title'),
    url: '/market',
  });
  return (
    <>
      <StructuredData ld={ld} />
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
