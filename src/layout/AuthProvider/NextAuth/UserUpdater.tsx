'use client';

import { useSession } from 'next-auth/react';
import { memo } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { useUserStore } from '@/store/user';
import { LobeUser } from '@/types/user';

// update the user data into the context
const UserUpdater = memo(() => {
  const { data: session, status } = useSession();
  const isLoaded = status !== 'loading';

  const isSignedIn = (status === 'authenticated' && session && !!session.user) || false;

  const nextUser = session?.user;
  const useStoreUpdater = createStoreUpdater(useUserStore);

  const lobeUser = {
    avatar: nextUser?.image,
    email: nextUser?.email,
    fullName: nextUser?.name,
    id: nextUser?.id,
  } as LobeUser;

  useStoreUpdater('isLoaded', isLoaded);
  useStoreUpdater('user', lobeUser);
  useStoreUpdater('isSignedIn', isSignedIn);

  useStoreUpdater('nextSession', session);
  useStoreUpdater('nextUser', nextUser);

  return null;
});

export default UserUpdater;
