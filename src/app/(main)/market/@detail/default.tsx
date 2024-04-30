import ServerLayout from '@/components/server/ServerLayout';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import AgentDetailContent from './features/AgentDetailContent';

const Layout = ServerLayout({ Desktop, Mobile });

const Detail = () => {
  return (
    <Layout>
      <AgentDetailContent />
    </Layout>
  );
};

Detail.displayName = 'AgentDetail';

export default Detail;
