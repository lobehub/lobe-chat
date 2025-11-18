'use client';

import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flexbox } from 'react-layout-kit';

import { enableAuth, enableNextAuth } from '@/const/auth';
import DataStatistics from '@/features/User/DataStatistics';
import UserInfo from '@/features/User/UserInfo';
import UserLoginOrSignup from '@/features/User/UserLoginOrSignup/Community';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

const UserBanner = memo(() => {
  const navigate = useNavigate();
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
            // If use NextAuth, call openLogin method directly
            if (enableNextAuth) {
              signIn();
              return;
            }
            navigate('/login');
          }}
        />
      )}
    </Flexbox>
  );
});

export default UserBanner;
