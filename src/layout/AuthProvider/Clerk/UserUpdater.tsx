'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { memo, useEffect } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { useUserStore } from '@/store/user';
import { LobeUser } from '@/types/user';

// update the user data into the context
const UserUpdater = memo(() => {
  const { isLoaded, user, isSignedIn } = useUser();

  const { session, openUserProfile, signOut, openSignIn } = useClerk();

  const useStoreUpdater = createStoreUpdater(useUserStore);

  useStoreUpdater('isLoaded', isLoaded);
  useStoreUpdater('isSignedIn', isSignedIn);
  useStoreUpdater('clerkSession', session);
  useStoreUpdater('clerkSignIn', openSignIn);
  useStoreUpdater('clerkOpenUserProfile', openUserProfile);
  useStoreUpdater('clerkSignOut', signOut);

  // 使用 useEffect 处理需要保持同步的用户数据
  useEffect(() => {
    if (user) {
      const userAvatar = useUserStore.getState().user?.avatar;

      const lobeUser = {
        // 头像使用设置的
        avatar: userAvatar || '',
        firstName: user.firstName,
        fullName: user.fullName,
        id: user.id,
        latestName: user.lastName,
        username: user.username,
      } as LobeUser;

      // 更新用户相关数据
      useUserStore.setState({
        clerkUser: user,
        user: lobeUser,
      });
    }
  }, [user]);
  return null;
});

export default UserUpdater;
