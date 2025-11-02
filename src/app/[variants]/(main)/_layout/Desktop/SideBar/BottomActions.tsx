import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const BottomActions = memo(() => {
  // GitHub and Labs icons are permanently hidden in minimal chat
  return <Flexbox gap={8} />;
});

export default BottomActions;
