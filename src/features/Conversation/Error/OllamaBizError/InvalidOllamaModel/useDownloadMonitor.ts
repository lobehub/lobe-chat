import { useEffect, useRef, useState } from 'react';

import { formatTime } from '@/utils/speed';

export const formatSize = (bytes: number): string => {
  const kbSize = bytes / 1024;
  if (kbSize < 1024) {
    return `${kbSize.toFixed(1)} KB`;
  } else if (kbSize < 1_048_576) {
    const mbSize = kbSize / 1024;
    return `${mbSize.toFixed(1)} MB`;
  } else {
    const gbSize = kbSize / 1_048_576;
    return `${gbSize.toFixed(1)} GB`;
  }
};

const formatSpeed = (speed: number): string => {
  return `${formatSize(speed)}/s`;
};

export const useDownloadMonitor = (totalSize: number, completedSize: number) => {
  const [downloadSpeed, setDownloadSpeed] = useState<string>('0 KB/s');
  const [remainingTime, setRemainingTime] = useState<string>('-');

  const lastCompletedRef = useRef(completedSize);
  const lastTimedRef = useRef(Date.now());

  useEffect(() => {
    const currentTime = Date.now();
    const elapsedTime = (currentTime - lastTimedRef.current) / 1000; // in seconds
    if (completedSize > 0 && elapsedTime > 1) {
      const speed = Math.max(0, (completedSize - lastCompletedRef.current) / elapsedTime); // in bytes per second
      setDownloadSpeed(formatSpeed(speed));

      const remainingSize = totalSize - completedSize;
      const time = remainingSize / speed; // in seconds
      setRemainingTime(formatTime(time));

      lastCompletedRef.current = completedSize;
      lastTimedRef.current = currentTime;
    }
  }, [completedSize]);

  return { downloadSpeed, remainingTime };
};
