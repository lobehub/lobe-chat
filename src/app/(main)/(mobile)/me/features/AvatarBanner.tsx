'use client';

import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import UserAvatar from '@/features/User/UserAvatar';

import { useStyles } from './style';

export const AVATAR_SIZE = 80;

const AvatarBanner = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();

  return (
    <>
      <Flexbox align={'center'} className={styles.bannerBox} justify={'center'}>
        <div className={styles.bannerImg}>
          <UserAvatar shape={'square'} size={AVATAR_SIZE} />
        </div>
      </Flexbox>
      <Flexbox className={styles.info}>{children}</Flexbox>
    </>
  );
});

export default AvatarBanner;
