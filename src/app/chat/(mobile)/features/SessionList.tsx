import { memo } from 'react';

import { SessionListContent } from '../../components/SessionList';
import Wrapper from '../../components/SessionList/Mobile';

const SessionList = memo(() => (
  <Wrapper>
    <SessionListContent />
  </Wrapper>
));

export default SessionList;
