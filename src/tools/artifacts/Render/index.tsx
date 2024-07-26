import { memo } from 'react';

import { BuiltinRenderProps } from '@/types/tool';

const Render = memo<BuiltinRenderProps>((props) => {
  console.log(props);
  return <div>artifacts</div>;
});

export default Render;
