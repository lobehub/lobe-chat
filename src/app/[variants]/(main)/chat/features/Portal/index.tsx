import { Suspense } from 'react';

import Portal from '@/app/[variants]/(main)/chat/features/Portal/features/Portal';
import PortalPanel from '@/app/[variants]/(main)/chat/features/Portal/features/PortalPanel';
import BrandTextLoading from '@/components/Loading/BrandTextLoading';

const ChatPortal = () => {
  return (
    <Portal>
      <Suspense fallback={<BrandTextLoading />}>
        <PortalPanel mobile={false} />
      </Suspense>
    </Portal>
  );
};

ChatPortal.displayName = 'ChatPortal';

export default ChatPortal;
