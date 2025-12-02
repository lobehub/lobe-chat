import { memo } from 'react';

import HomeContent from './features';

const Home = memo(() => {
  return <HomeContent onOpenFile={() => {}} />;
});

Home.displayName = 'Home';

export default Home;
