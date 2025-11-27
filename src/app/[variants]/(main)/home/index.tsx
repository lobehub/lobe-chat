import { memo } from 'react';

import Sidebar from './Sidebar';

const Home = memo(() => {
  return (
    <>
      <Sidebar />
      <div>Home Page</div>
    </>
  );
});

Home.displayName = 'Home';

export default Home;
