'use client';

import { useTimeout } from 'ahooks';
import { useRouter } from 'next/navigation';
import { memo } from 'react';

import { useGlobalStore } from '@/store/global';

const ChangelogModal = memo<{ currentId?: string }>(({ currentId }) => {
  const latestChangelogId = useGlobalStore((s) => s.status.latestChangelogId);
  const router = useRouter();

  useTimeout(() => {
    if (latestChangelogId !== currentId) {
      console.log('ChangelogModal', currentId, latestChangelogId);
      router.push('/changelog');
    }
  }, 1000);

  return null;
});

export default ChangelogModal;
