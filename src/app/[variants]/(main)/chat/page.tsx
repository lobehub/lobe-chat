'use client';

import dynamic from 'next/dynamic';

import { BrandTextLoading } from '@/components/Loading';

const ChatRouter = dynamic(() => import('./ChatRouter'), {
  loading: BrandTextLoading,
  ssr: false,
});

export default ChatRouter;
