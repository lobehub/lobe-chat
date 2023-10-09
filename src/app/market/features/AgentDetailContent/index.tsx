import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AgentInfo from './AgentInfo';

const AgentDetailContent = memo(() => (
  <Flexbox>
    <AgentInfo />
  </Flexbox>
));

export default AgentDetailContent;
