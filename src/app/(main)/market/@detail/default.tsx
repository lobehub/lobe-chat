import ServerLayout from '@/components/server/ServerLayout';
import { isMobileDevice } from '@/utils/responsive';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import AgentDetailContent from './features/AgentDetailContent';

const Layout = ServerLayout({ Desktop, Mobile });

const Detail = () => {
  const mobile = isMobileDevice();
  return (
    <Layout>
      <AgentDetailContent mobile={mobile} />
    </Layout>
  );
};

Detail.displayName = 'AgentDetail';

export default Detail;
