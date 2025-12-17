'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Link } from 'react-router-dom';

import { enableAuth } from '@/const/auth';
import DataStatistics from '@/features/User/DataStatistics';
import UserInfo from '@/features/User/UserInfo';
import UserLoginOrSignup from '@/features/User/UserLoginOrSignup/Community';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

const UserBanner = memo(() => {
  const isLoginWithAuth = useUserStore(authSelectors.isLoginWithAuth);
  const [signIn] = useUserStore((s) => [s.openLogin]);

  return (
    <Flexbox gap={12} paddingBlock={8}>
      {!enableAuth || (enableAuth && isLoginWithAuth) ? (
        <>
          <Link style={{ color: 'inherit' }} to="/profile">
            <UserInfo />
          </Link>
          <Link style={{ color: 'inherit' }} to="/profile/stats">
            <DataStatistics paddingInline={12} />
          </Link>
        </>
      ) : (
        <UserLoginOrSignup
          onClick={() => {
            signIn();
          }}
        />
      )}
    </Flexbox>
  );
});

export default UserBanner;
