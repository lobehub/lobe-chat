import { memo } from 'react';

import { AgentCardProps } from '@/app/market/features/AgentCard';

import Index from '../index';
import Layout from './layout.mobile';

export default memo<AgentCardProps>((props) => (
  <Layout>
    <Index {...props} />
  </Layout>
));
