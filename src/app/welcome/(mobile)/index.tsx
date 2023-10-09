import { memo } from 'react';

import Showcase from './features/Showcase';
import Layout from './layout.mobile';

export default memo(() => (
  <Layout>
    <Showcase />
  </Layout>
));
