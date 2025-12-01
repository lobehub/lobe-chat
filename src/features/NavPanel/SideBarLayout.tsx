import { ScrollShadow } from '@lobehub/ui';
import { ReactNode, Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SkeletonList, { SkeletonItem } from '@/features/NavPanel/Body/SkeletonList';

interface SidbarLayoutProps {
  body?: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
}

const SideBarLayout = memo<SidbarLayoutProps>(({ header, body, footer }) => {
  return (
    <Flexbox gap={4} style={{ height: '100%', overflow: 'hidden' }}>
      <Suspense fallback={<SkeletonItem height={44} />}>{header}</Suspense>
      <ScrollShadow size={2} style={{ height: '100%' }}>
        <Suspense fallback={<SkeletonList paddingBlock={8} />}>{body}</Suspense>
      </ScrollShadow>
      <Suspense>{footer}</Suspense>
    </Flexbox>
  );
});

export default SideBarLayout;
