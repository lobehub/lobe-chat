import { useResponsive } from 'antd-style';
import { memo } from 'react';

import { SessionListContent } from '../../../components/SessionList';
import Mobile from '../../../components/SessionList/Mobile';
import Desktop from './Desktop';

const ResponsiveSessionList = memo(() => {
  const { mobile } = useResponsive();

  const Wrapper = mobile ? Mobile : Desktop;

  return (
    <Wrapper>
      <SessionListContent />
    </Wrapper>
  );
});

export default ResponsiveSessionList;
