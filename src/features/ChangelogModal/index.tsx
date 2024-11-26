'use client';

import { useTimeout } from 'ahooks';
import { useRouter } from 'next/navigation';
import { memo } from 'react';

import { useGlobalStore } from '@/store/global';

const ChangelogModal = memo(() => {
  const router = useRouter();
  const [useCheckLatestChangelogId, latestChangelogId] = useGlobalStore((s) => [
    s.useCheckLatestChangelogId,
    s.status.latestChangelogId,
  ]);
  const { data } = useCheckLatestChangelogId();

  useTimeout(() => {
    if (!data) return;
    if (latestChangelogId !== data) router.push('/changelog');
  }, 1000);

  return null;
});

export default ChangelogModal;
