import { memo } from 'react';

import ChatHydration from './ChatHydration';
import SessionHydration from './SessionHydration';

/**
 * Hydration - 状态同步容器组件
 * 包含所有需要同步URL和Store状态的子组件
 */
const Hydration = memo(() => {
  return (
    <>
      <SessionHydration />
      <ChatHydration />
    </>
  );
});

Hydration.displayName = 'Hydration';

export default Hydration;
