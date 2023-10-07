import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AgentInfo from './AgentInfo';

export const AgentDetailContent = memo(() => (
  <Flexbox>
    <AgentInfo />
  </Flexbox>
));
