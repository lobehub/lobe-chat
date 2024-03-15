import { useEffect, useMemo, useState } from 'react';

const formatSpeed = (speed: number): string => {
  const kbPerSecond = speed / 1024;
  if (kbPerSecond < 1024) {
    return `${kbPerSecond.toFixed(1)} KB/s`;
  } else {
    const mbPerSecond = kbPerSecond / 1024;
    return `${mbPerSecond.toFixed(1)} MB/s`;
  }
};

const formatTime = (timeInSeconds: number): string => {
  if (timeInSeconds < 60) {
    return `${timeInSeconds.toFixed(1)} s`;
  } else if (timeInSeconds < 3600) {
    return `${(timeInSeconds / 60).toFixed(1)} min`;
  } else {
    return `${(timeInSeconds / 3600).toFixed(2)} h`;
  }
};

export const useDownloadMonitor = (totalSize: number, completedSize: number) => {
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [downloadSpeed, setDownloadSpeed] = useState<string>('0 KB/s');
  const [remainingTime, setRemainingTime] = useState<string>('-');

  const isReady = useMemo(() => completedSize > 0, [completedSize]);

  useEffect(() => {
    const currentTime = Date.now();
    // mark as start download
    if (isReady) {
      const elapsedTime = (currentTime - startTime) / 1000; // in seconds
      const speed = completedSize / elapsedTime; // in bytes per second

      const remainingSize = totalSize - completedSize;
      const time = remainingSize / speed; // in seconds

      setDownloadSpeed(formatSpeed(speed));
      setRemainingTime(formatTime(time));
    } else {
      setStartTime(currentTime);
    }
  }, [isReady, completedSize]);

  return { downloadSpeed, remainingTime };
};
