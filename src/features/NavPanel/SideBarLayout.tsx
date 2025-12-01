import { ScrollShadow } from '@lobehub/ui';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

interface SidbarLayoutProps {
  body?: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
}

const SideBarLayout = memo<SidbarLayoutProps>(({ header, body, footer }) => {
  return (
    <Flexbox gap={4} style={{ height: '100%', overflow: 'hidden' }}>
      {header}
      <ScrollShadow size={2} style={{ height: '100%' }}>
        {body}
      </ScrollShadow>
      {footer}
    </Flexbox>
  );
});

export default SideBarLayout;
