import { createStyles, useResponsive } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import MobileTabBar from '@/features/MobileTabBar';
import SideBar from '@/features/SideBar';

const useStyles = createStyles(({ css }) => ({
  mobileTabBar: css`
    position: fixed;
    z-index: 100;
    right: 0;
    bottom: 0;
    left: 0;
  `,
}));

const AppLayout = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  const { mobile } = useResponsive();

  if (mobile)
    return (
      <Flexbox style={{ position: 'relative' }} width={'100%'}>
        {children}

        <MobileTabBar className={styles.mobileTabBar} />
      </Flexbox>
    );

  return (
    <Flexbox horizontal width={'100%'}>
      <SideBar />
      {children}
    </Flexbox>
  );
});

export default AppLayout;
