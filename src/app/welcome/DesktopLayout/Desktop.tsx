import { Logo } from '@lobehub/ui';
import Link from 'next/link';
import { PropsWithChildren, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import AppLayoutDesktop from '@/layout/AppLayout.desktop';

import { useStyles } from '../features/Banner/style';

const Desktop = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return (
    <AppLayoutDesktop>
      <Center
        className={styles.layout}
        flex={1}
        height={'100vh'}
        horizontal
        style={{ position: 'relative' }}
      >
        <Link href={'/'}>
          <Logo className={styles.logo} size={36} type={'text'} />
        </Link>
        <Flexbox className={styles.view} flex={1} style={{ maxWidth: 1024 }}>
          {children}
        </Flexbox>
      </Center>
    </AppLayoutDesktop>
  );
});

export default Desktop;
