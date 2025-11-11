import { memo } from 'react';

import SmartAgentActionButton from './SmartAgentActionButton';

export const HeaderContent = memo<{ mobile?: boolean; modal?: boolean }>(({ modal }) => {
  return <SmartAgentActionButton modal={modal} />;
});

export default HeaderContent;
