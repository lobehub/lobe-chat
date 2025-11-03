import { memo } from 'react';

import SubmitAgentButton from './SubmitAgentButton';

export const HeaderContent = memo<{ mobile?: boolean; modal?: boolean }>(({ modal }) => {
  return <SubmitAgentButton modal={modal} />;
});

export default HeaderContent;
