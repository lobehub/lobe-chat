import { memo } from 'react';

import { AgentDetailContent } from '../components/AgentDetail';
import Mobile from '../components/AgentDetail/Mobile';

const AgentDetail = memo(() => (
  <Mobile>
    <AgentDetailContent />
  </Mobile>
));

export default AgentDetail;
