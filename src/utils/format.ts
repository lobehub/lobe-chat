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

/**
 * format speed from KB number to string like KB/s, MB/s or GB/s
 * @param speed
 */
export const formatSpeed = (speed: number) => `${formatSize(speed)}/s`;

export const formatTime = (timeInSeconds: number): string => {
  if (timeInSeconds < 60) {
    return `${timeInSeconds.toFixed(1)} s`;
  } else if (timeInSeconds < 3600) {
    return `${(timeInSeconds / 60).toFixed(1)} min`;
  } else {
    return `${(timeInSeconds / 3600).toFixed(2)} h`;
  }
};
