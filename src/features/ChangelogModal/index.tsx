'use client';

import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';

import { useGlobalStore } from '@/store/global';

const ChangelogModal = memo(() => {
  const router = useRouter();
  const [useCheckLatestChangelogId, latestChangelogId] = useGlobalStore((s) => [
    s.useCheckLatestChangelogId,
    s.status.latestChangelogId,
  ]);
  const { data } = useCheckLatestChangelogId();

  useEffect(() => {
    if (!data) return;
    if (latestChangelogId !== data) router.push('/changelog');
  }, [data, latestChangelogId]);

  return null;
});

export default ChangelogModal;
