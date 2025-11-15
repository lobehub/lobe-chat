'use client';

import { useTimeout } from 'ahooks';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGlobalStore } from '@/store/global';

const ChangelogModal = memo<{ currentId?: string }>(({ currentId }) => {
  const [latestChangelogId, updateSystemStatus] = useGlobalStore((s) => [
    s.status.latestChangelogId,
    s.updateSystemStatus,
  ]);
  const navigate = useNavigate();

  useTimeout(() => {
    if (!currentId) return;
    if (!latestChangelogId) {
      updateSystemStatus({ latestChangelogId: currentId });
    } else if (latestChangelogId !== currentId) {
      navigate('/changelog/modal');
    }
  }, 1000);

  return null;
});

export default ChangelogModal;
