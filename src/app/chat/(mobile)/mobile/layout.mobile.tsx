'use client';

import { PropsWithChildren } from 'react';

import AppLayoutMobile from '@/layout/AppLayout.mobile';

import ChatHeader from '../features/ChatHeader';

export default ({ children }: PropsWithChildren) => (
  <AppLayoutMobile navBar={<ChatHeader />}>{children}</AppLayoutMobile>
);
