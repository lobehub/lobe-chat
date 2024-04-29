'use client';

import { PropsWithChildren, memo } from 'react';

const MobileLayout = memo<PropsWithChildren>(({ children }) => {
  return <div style={{ height: '100%', paddingInline: 16 }}>{children}</div>;
});

export default MobileLayout;
