import { Logo, Tag } from '@lobehub/ui';
import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import { CURRENT_VERSION } from '@/const/version';
import { isMobileDevice } from '@/utils/responsive';

const COPYRIGHT = `© 2023-${new Date().getFullYear()} LobeHub, LLC`;

const Layout = ({ children }: PropsWithChildren) => {
  const isMobile = isMobileDevice();
  return (
    <Flexbox align={'center'} gap={12} paddingBlock={36} width={'100%'}>
      <Logo size={isMobile ? 100 : 120} />
      <h1 style={{ fontSize: isMobile ? 32 : 36, fontWeight: 900, lineHeight: 1, marginBottom: 0 }}>
        LobeChat
      </h1>
      <Tag>v{CURRENT_VERSION}</Tag>
      {children}
      <div>Empowering your AI dreams by LobeHub</div>
      <div style={{ fontWeight: 400, opacity: 0.33 }}>{COPYRIGHT}</div>
    </Flexbox>
  );
};

export default Layout;
