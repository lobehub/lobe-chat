import { Flexbox } from 'react-layout-kit';

import Artifacts from './Artifacts';

const Home = () => {
  return (
    <Flexbox gap={12} height={'100%'}>
      <Artifacts />
    </Flexbox>
  );
};

export default Home;
