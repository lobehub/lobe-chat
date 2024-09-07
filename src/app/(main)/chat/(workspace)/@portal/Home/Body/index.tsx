import { Flexbox } from 'react-layout-kit';

import Artifacts from './Artifacts';
import Files from './Files';

const Home = () => {
  return (
    <Flexbox gap={12} height={'100%'}>
      <Files />
      <Artifacts />
    </Flexbox>
  );
};

export default Home;
