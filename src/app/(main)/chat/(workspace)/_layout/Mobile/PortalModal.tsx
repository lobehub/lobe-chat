'use client';

import { PropsWithChildren, memo } from 'react';

const PortalModal = memo(({ children }: PropsWithChildren) => {
  return children;
});

export default PortalModal;
