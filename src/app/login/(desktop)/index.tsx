'use client';

import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { useStyles } from '@/app/welcome/features/Banner/style';

import LoginDesktopLayout from './layout.desktop';

export default memo(() => {
  const { styles } = useStyles();

  return (
    <LoginDesktopLayout>
      <Center
        className={styles.layout}
        flex={1}
        height={'100%'}
        horizontal
        style={{ position: 'relative' }}
      >
        <Flexbox
          flex={1}
          justify={'center'}
          style={{ height: '100%', position: 'relative', width: '100%' }}
        >
          {/*<GridShowcase id={'GridShowcase'}>*/}

          {/*  <div className={styles.container}>*/}
          {/*    <Hero   mobile={mobile} width={mobile ? 640 : 1024}/>*/}
          {/*  </div>*/}
          {/*</GridShowcase>*/}
          {/*<div className={'bg-yellow'}>111</div>*/}
        </Flexbox>
      </Center>
    </LoginDesktopLayout>
  );
});
