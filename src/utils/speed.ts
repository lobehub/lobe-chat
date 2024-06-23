/**
 * format speed from KB number to string like KB/s, MB/s or GB/s
 * @param speed
 */
export const formatSpeed = (speed: number) => {
  let word = '';

  // KB
  if (speed <= 1000) {
    word = speed.toFixed(2) + 'KB/s';
  }
  // MB
  else if (speed / 1024 <= 1000) {
    word = (speed / 1024).toFixed(2) + 'MB/s';
  }
  // GB
  else {
    word = (speed / 1024 / 1024).toFixed(2) + 'GB/s';
  }

  return word;
};

export const formatTime = (timeInSeconds: number): string => {
  if (timeInSeconds < 60) {
    return `${timeInSeconds.toFixed(1)} s`;
  } else if (timeInSeconds < 3600) {
    return `${(timeInSeconds / 60).toFixed(1)} min`;
  } else {
    return `${(timeInSeconds / 3600).toFixed(2)} h`;
  }
};
