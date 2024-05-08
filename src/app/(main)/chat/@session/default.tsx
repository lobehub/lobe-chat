import ServerLayout from '@/components/server/ServerLayout';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import SessionHydration from './features/SessionHydration';
import SessionListContent from './features/SessionListContent';

const Layout = ServerLayout({ Desktop, Mobile });

const Session = () => {
  return (
    <>
      <Layout>
        <SessionListContent />
      </Layout>
      <SessionHydration />
    </>
  );
};

Session.displayName = 'Session';

export default Session;
