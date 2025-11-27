import { memo } from 'react';

import Sidebar from './Sidebar';
import HomeContent from './components';

const Home = memo(() => {
  return (
    <>
      <Sidebar />
      <HomeContent onOpenFile={() => {}} />
    </>
  );
});

Home.displayName = 'Home';

export default Home;
